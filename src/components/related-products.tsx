
import type { Product } from "@/lib/types";
import ProductCard from "./product-card";

type RelatedProductsProps = {
    title: string;
    products: Product[];
}

const RelatedProducts = ({ title, products }: RelatedProductsProps) => {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default RelatedProducts;
