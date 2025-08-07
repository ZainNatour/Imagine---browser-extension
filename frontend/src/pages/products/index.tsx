import { useState } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { sampleProducts } from '../../data/products';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [store, setStore] = useState('');

  const stores = Array.from(new Set(sampleProducts.map((p) => p.store)));

  const filtered = sampleProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStore = store ? p.store === store : true;
    return matchesSearch && matchesStore;
  });

  return (
    <div>
      <h1>Products</h1>
      <div>
        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={store} onChange={(e) => setStore(e.target.value)}>
          <option value="">All Stores</option>
          {stores.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>
            <Link href={`/products/${p.id}`}>{p.name}</Link> - ${p.price.toFixed(2)} ({p.store})
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
