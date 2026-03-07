<?php
namespace App\Http\Service;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\RoleType;
use App\Enums\Status;
use App\Enums\VoucherStatus;
use App\Exceptions\BusinessException;
use App\Exceptions\ErrorCode;
use App\Http\Mapper\OrderMapper;
use App\Http\Mapper\ProductVariantMapper;
use App\Http\Mapper\VoucherMapper;
use App\Http\Responses\PageResponse;
use App\Http\Service\GhnService;
use App\Http\Service\VoucherService;
use App\Http\States\OrderStateFactory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\orders\OrderCreationRequest;
use Illuminate\Support\Facades\Log;
use App\Utils\ShippingHelper;
class OrderService
{
    protected $voucherService;
    protected $ghnService;
    protected $userSerive;
    protected $firebaseService;
    public function __construct(VoucherService $voucherService, GhnService $ghnService, UserService $userSerive, FirebaseService $firebaseService)
    {
        $this->voucherService = $voucherService;
        $this->ghnService = $ghnService;
        $this->userSerive = $userSerive;
        $this->firebaseService = $firebaseService;
    }

    public function findAllByUser(?string $keyword, ?string $sort, int $page, int $size, ?string $startDate, ?string $endDate, ?string $orderStatus): PageResponse
    {
        $user = auth()->user();
        $query = Order::where('user_id', $user->id);

        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);

        if ($orderStatus) {
            $query->where('order_status', $orderStatus);
        }
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }
        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->orWhereHas('orderItems', function ($oi) use ($keyword) {
                    $oi->where('name_product_snapshot', 'like', "%{$keyword}%");
                });
            });
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);
        $dtoItems = $paginator->getCollection()->map(function ($order) {
            return OrderMapper::toOrderResponse($order);
        });
        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }

    public function findAllByAdmin(?string $keyword, ?string $sort, int $page, int $size, ?string $startDate, ?string $endDate, ?string $orderStatus): PageResponse
    {
        $query = Order::query();

        $column = 'id';
        $direction = 'asc';
        if ($sort && str_contains($sort, ':')) {
            $parts = explode(':', $sort);
            $column = $parts[0];
            $direction = strtolower($parts[1]) === 'asc' ? 'asc' : 'desc';
        }
        $query->orderBy($column, $direction);


        if ($orderStatus) {
            $query->where('order_status', $orderStatus);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('order_tracking_code', 'like', "%{$keyword}%")
                    ->orWhere('customer_name', 'like', "%{$keyword}%")
                    ->orWhereHas('user', function ($u) use ($keyword) {
                        $u->where('full_name', 'like', "%{$keyword}%");
                    });
            });
        }

        $paginator = $query->paginate($size, ['*'], 'page', $page);

        $dtoItems = $paginator->getCollection()->map(function ($order) {
            return OrderMapper::toOrderResponse($order);
        });
        $paginator->setCollection($dtoItems);

        return PageResponse::fromLaravelPaginator($paginator);
    }
    public function changeStatus($orderId, $status)
    {
        return DB::transaction(function () use ($orderId, $status) {
            $order = Order::where('id', $orderId)
                ->firstOrFail();
            if ($order->payment_type == PaymentType::BANK_TRANSFER && $order->payment_status == PaymentStatus::UNPAID) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, 'Không thể chuyển trạng thái cho đơn chưa thanh toán !');
            }
            $nextStatus = DeliveryStatus::tryFrom($status);
            $currentState = OrderStateFactory::getState($order->order_status);
            $currentState->changeState($order, $nextStatus, $this->firebaseService);
            $order->save();
        });
    }
    public function completeOrder($orderId)
    {
        $currentUser = auth()->user();
        $order = Order::where('id', $orderId)
            ->firstOrFail();
       Log::info("DEBUG - Current Order Status: " . $order->order_status->value);
        if ($order->user_id !== $currentUser->id) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Đơn này không thuộc về bạn !');
        }
        if ($order->order_status !== DeliveryStatus::COMPLETED) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Đơn chưa hoàn thành !');
        }
        if ($order->payment_status == PaymentStatus::UNPAID) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Đơn chưa thanh toán !');
        }
        if ($order->is_confirmed) {
            throw new BusinessException(ErrorCode::BAD_REQUEST, 'Đơn này đã được xác nhận !');
        }
        $order->is_confirmed = true;
        $currentUser->total_spent = $order->total_spent + $order->total_amount;
        $this->userSerive->updateRank($currentUser);
        $order->completed_at = Carbon::now();
        $order->save();
    }
    private function updateSoldQuantity(array $orderItems)
    {
        DB::transaction(function () use ($orderItems) {
            foreach ($orderItems as $item) {
                $variant = ProductVariant::find($item->product_variant_id)->firstOrFail();

                if (!$variant || !$variant->product) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Không tìm thấy thông tin sản phẩm cho item ID: {$item->id}");
                }

                $product = $variant->product;
                if ($product->status !== Status::ACTIVE) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Sản phẩm {$product->name} hiện không còn hoạt động.");
                }
                $product->increment('sold_quantity', $item->quantity);
            }
        });

    }
    public function cancelOrder(int $orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $currentUser = auth()->user();
            $order = Order::where('id', $orderId)->firstOrFail();

            if ($order->user_id !== $currentUser->id) {
                throw new BusinessException(ErrorCode::UNAUTHORIZED, "Đơn hàng này không phải của bạn");
            }

            if ($order->order_status === DeliveryStatus::PENDING) {
                if (
                    $order->payment_type === PaymentType::COD ||
                    ($order->payment_type == PaymentType::BANK_TRANSFER && $order->payment_status == PaymentStatus::UNPAID)
                ) {
                    foreach ($order->orderItem as $item) {
                        $variant = ProductVariant::where('id', $item->product_variant_id)->firstOrFail();
                        $variant->increment('quantity', $item->quantity);
                        $variant->save();
                    }
                }

                $order->order_status = DeliveryStatus::CANCELLED;
                $order->save();
                return $order;
            } else {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Không thể hủy đơn hàng ở trạng thái này");
            }
        });
    }
    public function completePayment(int $orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::where("id", $orderId)->firstOrFail();
            if ($order->payment_type !== PaymentType::BANK_TRANSFER) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng không phải loại thanh toán ngân hàng");
            }

            if ($order->payment_status === PaymentStatus::PAID) {
                throw new BusinessException(ErrorCode::BAD_REQUEST, "Đơn hàng đã được thanh toán trước đó");
            }

            foreach ($order->orderItem as $item) {
                $variant = ProductVariant::where('id', $item->product_variant_id)->firstOrFail();
                if ($variant->quantity < $item->quantity) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Sản phẩm {$variant->sku} đã hết hàng trong lúc thanh toán");
                }
                $variant->decrement('quantity', $item->quantity);
            }

            $order->payment_status = PaymentStatus::PAID;
            $order->payment_at = Carbon::now();
            $order->save();

            return $order;
        });
    }
    public function getOrderById(int $orderId)
    {
        $user = auth()->user();
        $order = Order::findOrFail($orderId);

        if ($order->user_id !== $user->id) {
            throw new BusinessException(ErrorCode::UNAUTHORIZED, "Đơn hàng không phải của bạn");
        }

        return OrderMapper::toOrderResponse($order);
    }

    public function getOrderByIdForAdmin(int $orderId)
    {
        $order = Order::findOrFail($orderId);
        return OrderMapper::toOrderResponse($order);
    }

    public function create(OrderCreationRequest $req)
    {
        return DB::transaction(function () use ($req) {
            Log::info("create Order");
            $currentUser = null;
            if (request()->bearerToken()) {
                $currentUser = auth('api')->user();
            }
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
                $id = $item['productVariantId'];
                $quantity = $item['quantity'];

                $carry[$id] = ($carry[$id] ?? 0) + $quantity;

                return $carry;
            }, []);

            Log::info('mergedVariants', $mergedVariants);
            $subTotal = 0;
            $orderItems = [];
            $packages = [];
            $ghnItems = [];
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

                $orderItem = new OrderItem();
                $orderItem->list_price_snapShot = $productVariant->price;
                $orderItem->name_product_snapshot = $productVariant->product->name;
                $orderItem->url_image_snapShot = $productVariant->product->url_image_cover;
                $orderItem->product_id = $productVariant->product_id;
                $orderItem->quantity = $totalQuantity;
                $orderItem->product_variant_id = $productVariant->id;
                $orderItem->variant_attributes_snapshot = ProductVariantMapper::toVariantResponse($productVariant);

                $itemTotal = $productVariant->price * $totalQuantity;
                $subTotal += $itemTotal;
                $orderItem->final_price = $productVariant->price;

                $orderItems[] = $orderItem;

                $packages[] = [
                    'name' => $productVariant->product->name,
                    'length' => $productVariant->length,
                    'width' => $productVariant->width,
                    'height' => $productVariant->height,
                    'weight' => $productVariant->weight,
                    'quantity' => $totalQuantity,
                ];
                $ghnItems[] = [
                    "name" => $productVariant->product->name,
                    "weight" => (int) $productVariant->weight,
                    "width" => (int) $productVariant->width,
                    "height" => (int) $productVariant->height,
                    "length" => (int) $productVariant->length,
                ];
            }
            $order->weight = ShippingHelper::calculateTotalWeight($packages);
            $order->length = ShippingHelper::calculateAverageLength($packages);
            $order->width = ShippingHelper::calculateAverageWidth($packages);
            $order->height = ShippingHelper::calculateAverageHeight($packages);
            $order->service_type_id = ShippingHelper::determineServiceTypeId($order->weight, $order->length, $order->width, $order->height);
            $feeResponse = $this->ghnService->calculateShippingFee($order, $ghnItems);
            $feeShip = $feeResponse['total'];
            $order->total_fee_for_ship = $feeShip;

            $discountValue = 0;
            $voucher = null;
            if ($req->voucherId) {
                if (!$currentUser) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, 'Vui lòng đăng nhập để sử dụng voucher !');
                }
                $voucher = Voucher::where('id', $req->voucherId)
                    ->where('status', operator: VoucherStatus::ACTIVE)
                    ->first();

                if (!$voucher) {
                    throw new BusinessException(ErrorCode::BAD_REQUEST, "Voucher not found");
                }

                $this->voucherService->validateVoucherWithOrderAmount($voucher, $subTotal);
                $this->voucherService->validateVoucherUsageUser($voucher, $currentUser);

                if ($voucher->is_shipping) {
                    $discountValue = $this->voucherService->calculateDiscountValue($feeShip, $voucher);
                } else {
                    $discountValue = $this->voucherService->calculateDiscountValue($subTotal, $voucher);
                }

                $this->voucherService->decreaseVoucherQuantity($voucher);

                $order->voucher_snapshot = json_encode(VoucherMapper::toVoucherResponse($voucher));
                $order->voucher_id = $voucher->id;
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
                    'order_id' => $order->id,
                    'usedAt'     => now(),
                ]);
            }
            if ($order->payment_type === PaymentType::COD) {
                foreach ($mergedVariants as $variantId => $totalQuantity) {
                    ProductVariant::where('id', $variantId)->decrement('quantity', $totalQuantity);
                }
            }
            $this->updateSoldQuantity($orderItems);

            $orderResponse = OrderMapper::toOrderResponse($order);
            $this->firebaseService->sendNotification(RoleType::ORDER_STAFF->value, [
                'title' => '📦 Đơn hàng mới!',
                'body' => 'Khách hàng vừa đặt đơn {$order->id} ',
                'order_id' => $order->id,
                'type' => 'new_order',
                'order_data' => json_encode($orderResponse),
            ]);

            return $order->id;
        });
    }
}