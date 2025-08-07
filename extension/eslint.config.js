import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintrc = JSON.parse(
  readFileSync(join(__dirname, '.eslintrc.json'), 'utf8')
);

export default compat.config(eslintrc);
