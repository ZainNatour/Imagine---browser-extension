import { readdirSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { loadFixture } from '../test/helpers/loadFixture.js';
import getProduct from '../src/content/getProduct.js';

const fixturesDir = path.resolve('test/html');
const goldenDir = path.resolve('test/golden');
mkdirSync(goldenDir, { recursive: true });

for (const file of readdirSync(fixturesDir)) {
  if (!file.endsWith('.html')) continue;
  const name = path.basename(file, '.html');
  loadFixture(name);
  const result = await getProduct();
  writeFileSync(path.join(goldenDir, `${name}.json`), JSON.stringify(result, null, 2));
}
