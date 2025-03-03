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
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-card-background">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          priority={false}
          loading="lazy"
        />
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-medium text-text-primary transition-colors">{product.name}</h3>
        <p className="text-sm font-medium text-text-primary transition-colors">{formattedPrice}</p>
      </div>
    </Link>
  );
}