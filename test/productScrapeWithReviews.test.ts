/** @jest-environment node */

import { readFileSync } from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import { getProduct } from '../src/content/getProduct';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

function setup(html: string, url: string) {
  const dom = new JSDOM(html, { url });
  // @ts-ignore
  global.window = dom.window as any;
  // @ts-ignore
  global.document = dom.window.document as any;
}

test('scrapes reviews from jsonld', async () => {
  const base = readFileSync(`${__dirname}/html/adidas.html`, 'utf-8');
  const reviewScript = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    review: [{ '@type': 'Review', reviewBody: 'Great', reviewRating: { ratingValue: '5' } }],
  })}</script>`;
  const html = base.replace('</head>', `${reviewScript}</head>`);
  setup(html, 'https://www.adidas.com/product/1');
  const { product } = await getProduct();
  expect(product?.reviews?.length).toBeGreaterThan(0);
});
