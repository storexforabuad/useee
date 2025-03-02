import { Product } from '../../types/product';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 px-4 sm:px-6 lg:px-8">
      {products.map((product) => (
        <div key={product.id} className="relative">
          {product.limitedStock && (
            <span className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
              Limited Stock
            </span>
          )}
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}