import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { sampleProducts } from '../data/products';

export default function TryOn() {
  const router = useRouter();
  const { productId } = router.query;
  const product = sampleProducts.find((p) => p.id === productId);

  return (
    <div>
      <h1>Virtual Try-On</h1>
      {product ? (
        <p>Preparing try-on experience for {product.name}...</p>
      ) : (
        <p>Select a product to try on.</p>
      )}
      <p>API integration coming soon.</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
