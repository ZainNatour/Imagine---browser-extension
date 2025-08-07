import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { sampleProducts, Product } from '../../data/products';
import { addToWishlist } from '../../lib/wishlist';

interface Props {
  product: Product | null;
}

export default function ProductDetail({ product }: Props) {
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price.toFixed(2)}</p>
      <p>Available at: {product.store}</p>
      <div>
        <button onClick={() => addToWishlist(product)}>Add to Wishlist</button>
        <button onClick={() => console.log('add to cart', product.id)}>Add to Cart</button>
        <Link href={`/try-on?productId=${product.id}`}>Try On</Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params as { id: string };
  const product = sampleProducts.find((p) => p.id === id) || null;
  return { props: { product } };
};
