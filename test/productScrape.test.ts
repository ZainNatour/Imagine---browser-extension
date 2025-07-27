import { readFileSync } from 'fs';
import { TextEncoder, TextDecoder } from 'util';
import { getProduct } from '../src/content/getProduct';

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

const cases = [
  ['amazon', 'https://www.amazon.com/dp/test'],
  ['asos', 'https://www.asos.com/product/1'],
  ['zara', 'https://www.zara.com/product/1'],
  ['hm', 'https://www.hm.com/product/1'],
  ['uniqlo', 'https://www.uniqlo.com/product/1'],
  ['nike', 'https://www.nike.com/product/1'],
  ['adidas', 'https://www.adidas.com/product/1'],
  ['gucci', 'https://www.gucci.com/product/1'],
  ['levi', 'https://www.levi.com/product/1'],
  ['gap', 'https://www.gap.com/product/1'],
  ['louisvuitton', 'https://www.louisvuitton.com/product/1'],
  ['underarmour', 'https://www.underarmour.com/product/1'],
  ['prada', 'https://www.prada.com/product/1'],
  ['versace', 'https://www.versace.com/product/1'],
];

test.each(cases)('scrape %s sample', async (name, url) => {
  const html = readFileSync(`${__dirname}/html/${name}.html`, 'utf-8');
  setup(html, url);
  const { product, similars } = await getProduct();
  expect(product).not.toBeNull();
  expect(similars.length).toBeGreaterThanOrEqual(4);
});

test('returns null when no product', async () => {
  setup('<html></html>', 'https://example.com');
  const { product } = await getProduct();
  expect(product).toBeNull();
});
