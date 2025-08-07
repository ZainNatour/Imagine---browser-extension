import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { Product } from '../data/products';
import { getWishlist, removeFromWishlist } from '../lib/wishlist';

export default function Wishlist() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  const remove = (id: string) => {
    removeFromWishlist(id);
    setItems(getWishlist());
  };

  return (
    <div>
      <h1>Wishlist</h1>
      {items.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <ul>
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.id}`}>{p.name}</Link>
              <button onClick={() => remove(p.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
