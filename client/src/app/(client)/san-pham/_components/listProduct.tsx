"use client";
import { Product } from "@/types/product";

export default function ListProduct({ products }: { products: Product[] }) {
    return (
        <div>
            <ul>
                {products.map((item: Product) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}
