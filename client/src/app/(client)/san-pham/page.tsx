export const revalidate = 3600; // Cache 1 tiếng (đơn vị: giây)
import { ProductApi } from "@/api/product.api";
import ListProduct from "@/app/(client)/san-pham/_components/listProduct";
import { Product } from "@/types/product";

async function getAllProducts() {
    try {
        const res = await ProductApi.getAllProducts();
        return res.data.data.data;
    } catch (err) {
        console.log(err);
    }
}

export default async function ProductPage() {
    const data: Product[] = await getAllProducts();
    console.log("ProductPage data:", data);
    return (
        <div>
            <h1>Danh sách sản phẩm (Đã cache)</h1>
            <ListProduct products={data} />
        </div>
    );
}
