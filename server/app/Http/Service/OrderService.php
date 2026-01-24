<?php
namespace App\Http\Service;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\Status;
use App\Enums\VoucherStatus;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Mapper\ProductVariantMapper;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\OrderCreationRequest;
use Server\App\Http\Service\GhnService;
use Server\App\Http\Service\VoucherService;
use Server\App\Utils\ShippingHelper;
class OrderService
{
    protected $voucherService;
    protected $ghnService;
    public function __construct(VoucherService $voucherService, GhnService $ghnService)
    {
        $this->voucherService = $voucherService;
        $this->ghnService = $ghnService;
    }

    public function create(OrderCreationRequest $req)
    {
        return DB::transaction(function () use ($req) {
            $currentUser = auth()->user();
            $order = new Order();
            $order->customer_name = $req->customerName;
            $order->customer_phone = $req->customerPhone;
            $order->delivery_ward_name = $req->deliveryWardName;
            $order->delivery_ward_code = $req->deliveryWardCode;
            $order->delivery_district_id = $req->deliveryDistrictId;
            $order->delivery_province_id = $req->deliveryProvinceId;
            $order->delivery_district_name = $req->deliveryDistrictName;
            $order->delivery_province_name = $req->deliveryProvinceName;
            $order->delivery_address = $req->deliveryAddress;
            $order->payment_type = $req->paymentType;
            $order->order_status = DeliveryStatus::PENDING;
            $order->payment_status = PaymentStatus::UNPAID;
            $order->note = $req->note;
            $order->user_id = $currentUser ? $currentUser->id : null;

            $mergedVariants = collect($req->order_items)->reduce(function ($carry, $item) {
                $id = $item['product_variant_id'];
                $quantity = $item['quantity'];

                $carry[$id] = ($carry[$id] ?? 0) + $quantity;

                return $carry;
            }, []);
            $subTotal = 0;
            $orderItems = [];
            $packages = [];
            foreach ($mergedVariants as $variantId => $totalQuantity) {
                $productVariant = ProductVariant::where('id', $variantId)
                    ->where('status', Status::ACTIVE)
                    ->lockForUpdate()
                    ->first();
                if (!$productVariant) {
                    throw new BusinessException(ErrorCode::NOT_EXISTED, "Product variant not found");
                }
                if ($totalQuantity > $productVariant->quantity) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Product {$productVariant->sku} exceeds available quantity.");
                }
                $productVariant->decrement('quantity', $totalQuantity);

                $orderItem = new OrderItem();
                $orderItem->list_price_snapShot = $productVariant->price;
                $orderItem->name_product_snapshot = $productVariant->product->name;
                $orderItem->url_image_snapShot = $productVariant->product->url_cover_image;
                $orderItem->quantity = $totalQuantity;
                $orderItem->variant_attributes_snapshot = ProductVariantMapper::toVariantResponse($productVariant);

                $itemTotal = $productVariant->price * $totalQuantity;
                $subTotal += $itemTotal;
                $orderItem->final_price = $productVariant->price;

                $orderItems[] = $orderItem;

                $packages = collect($orderItems)->map(function ($item) {
                    return [
                        'name' => $item->name_product_snapshot,
                        'length' => $item->productVariant->length,
                        'width' => $item->productVariant->width,
                        'height' => $item->productVariant->height,
                        'weight' => $item->productVariant->weight,
                        'quantity' => $item->quantity,
                    ];
                })->toArray();
            }
            $order->weight = ShippingHelper::calculateTotalWeight($packages);
            $order->length = ShippingHelper::calculateAverageLength($packages);
            $order->width = ShippingHelper::calculateAverageWidth($packages);
            $order->height = ShippingHelper::calculateAverageHeight($packages);

            $feeShip = $this->ghnService->calculateShippingFee($order)->total;
            $order->total_fee_for_ship = $feeShip;

            $discountValue = 0;
            $voucher = null;
            if ($req->voucherId) {
                $voucher = Voucher::where('id', $req->voucherId)
                    ->where('status', operator: VoucherStatus::ACTIVE)
                    ->first();

                if (!$voucher) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Voucher not found");
                }

                $this->voucherService->validateVoucherWithOrderAmount($voucher, $subTotal);
                $this->voucherService->validateVoucherUsageUser($voucher,$currentUser);
                
                if ($voucher->is_shipping) {
                    $discountValue = $this->voucherService->calculateDiscountValue($feeShip, $voucher);
                } else {
                    $discountValue = $this->voucherService->calculateDiscountValue($subTotal, $voucher);
                }

                $this->voucherService->decreaseVoucherQuantity($voucher);
                
                $order->voucher_snapshot = $voucher->toArray(); 
                $order->voucher_discount_value = $discountValue;
            }

            if ($discountValue > 0 && (!$voucher || !$voucher->is_shipping)) {
                foreach ($orderItems as $item) {
                    $itemTotal = $item->final_price * $item->quantity;
                    $ratio = $itemTotal / $subTotal;
                    $itemDiscount = $discountValue * $ratio;
                    $item->final_price = $item->final_price - ($itemDiscount / $item->quantity);
                }
            }

        
            $pointValue = $req->point ?? 0;
            $totalDiscount = $discountValue + $pointValue;
            
            $order->original_order_amount = $subTotal;
            $order->total_amount = ($subTotal - $totalDiscount) + $feeShip;
            $order->save(); 

            foreach ($orderItems as $item) {
                $item->order_id = $order->id;
                $item->save();
            }

            if ($currentUser && $req->point > 0) {
                $currentUser->decrement('point', $req->point);
            }

            if ($voucher && $currentUser) {
                VoucherUsage::create([
                    'voucher_id' => $voucher->id,
                    'user_id' => $currentUser->id,
                    'order_id' => $order->id
                ]);
            }

            // 9. Firebase Update
            // $this->fireBaseService->updateStatus($order);

            return $order->id;
        });
    }
}