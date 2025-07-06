import { readFileSync } from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import { getProduct } from '../src/content/getProduct.ts';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { JSDOM } = require('jsdom');

function setup(html: string, url: string) {
  const dom = new JSDOM(html, { url });
  // @ts-ignore
  global.window = dom.window as any;
  // @ts-ignore
  global.document = dom.window.document as any;
}

test.skip('scrape Amazon sample', async () => {
  const html = readFileSync(__dirname + '/html/amazon.html', 'utf-8');
  setup(html, 'https://www.amazon.com/dp/test');
  const { product, similars } = await getProduct();
  expect(product).not.toBeNull();
  expect(similars.length).toBeGreaterThanOrEqual(4);
});

test.skip('scrape ASOS sample', async () => {
  const html = readFileSync(__dirname + '/html/asos.html', 'utf-8');
  setup(html, 'https://www.asos.com/product/1');
  const { product, similars } = await getProduct();
  expect(product).not.toBeNull();
  expect(similars.length).toBeGreaterThanOrEqual(4);
});

test.skip('returns null when no product', async () => {
  setup('<html></html>', 'https://example.com');
  const { product } = await getProduct();
  expect(product).toBeNull();
});
