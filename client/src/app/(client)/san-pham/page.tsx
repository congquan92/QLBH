import { ProductApi } from "@/api/product.api";

export default async function Product() {
    const res = await ProductApi.getAllProducts();
    console.log(res.data);
    return <div>Trang Product</div>;
}
