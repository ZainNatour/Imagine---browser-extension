export interface Product {
  id: string;
  name: string;
  image: string;
  price?: number;
}

export async function fetchSuggestions(
  productIds: string[],
  prefs: { stores: string[]; style: string; event: string }
) {
  const res = await fetch(
    `${process.env.RECOMMENDER_URL}/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: productIds, ...prefs }),
    },
  );
  return (await res.json()) as Product[];
}
