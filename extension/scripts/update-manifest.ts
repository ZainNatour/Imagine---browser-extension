import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-friendly __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist/extension');
const assetsDir = path.join(distDir, 'assets');

function findHashedFile(prefix: string, ext: string): string {
  const files = fs.readdirSync(assetsDir);
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith(ext));
  if (!match) {
    throw new Error(`Unable to locate built file for ${prefix}`);
  }
  return `assets/${match}`;
}

function copyManifest() {
  const manifestPath = path.resolve(__dirname, '../manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Update file paths to match built output
  manifest.background.service_worker = findHashedFile('background', '.js');
  manifest.action.default_popup = 'src/popup/popup.html';
  manifest.side_panel.default_path = 'src/popup/popup.html';
  manifest.options_ui.page = 'src/options/options.html';
  manifest.content_scripts[0].js = [findHashedFile('content', '.js')];

  // Icons and web accessible resources live at the top level after build
  manifest.icons = {
    '16': 'icons/icon16.webp',
    '48': 'icons/icon48.webp',
    '128': 'icons/icon128.webp'
  };

  manifest.web_accessible_resources = [
    {
      resources: [
        'data/stores.json',
        'images/*',
        'src/popup/centralized-wishlist.html',
        'src/popup/centralized-wishlist.js',
        'src/popup/styles/base.css'
      ],
      matches: ['<all_urls>']
    }
  ];

  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Ensure additional popup files are available in dist
  const popupOutDir = path.join(distDir, 'src/popup');
  fs.mkdirSync(popupOutDir, { recursive: true });
  const cwSrcHtml = path.resolve(__dirname, '../src/popup/centralized-wishlist.html');
  const cwOutHtml = path.join(popupOutDir, 'centralized-wishlist.html');
  fs.copyFileSync(cwSrcHtml, cwOutHtml);
  fs.copyFileSync(
    path.resolve(__dirname, '../src/popup/centralized-wishlist.js'),
    path.join(popupOutDir, 'centralized-wishlist.js')
  );

  // copy base stylesheet and rewrite global CSS reference with hashed file
  const stylesOutDir = path.join(popupOutDir, 'styles');
  fs.mkdirSync(stylesOutDir, { recursive: true });
  fs.copyFileSync(
    path.resolve(__dirname, '../src/popup/styles/base.css'),
    path.join(stylesOutDir, 'base.css')
  );

  const globalCss = findHashedFile('global', '.css');
  let htmlContent = fs.readFileSync(cwOutHtml, 'utf8');
  htmlContent = htmlContent.replace('../styles/global.css', `/${globalCss}`);
  fs.writeFileSync(cwOutHtml, htmlContent);
}

try {
  copyManifest();
  console.log('✅ Manifest copied and updated');
} catch (err) {
  console.error(err);
  process.exit(1);
}
