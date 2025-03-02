import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../types/product';

export default function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover object-center"
          priority={false}
          loading="lazy" // Add lazy loading
        />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm font-medium text-gray-900">{formattedPrice}</p>
      </div>
    </Link>
  );
}