import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point at the built icons folder
const assetsDir = path.resolve(__dirname, '../dist/assets/icons');

async function walk(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const match = entry.name.match(/^icon(\d+)/);
        const size = match ? parseInt(match[1], 10) : 256;
        const base = path.basename(entry.name, ext);
        const outPath = path.join(dir, `${base}.webp`);

        // Re-encode to webp & resize
        await sharp(full)
          .resize(size, size, { fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(outPath);

        // Remove the original file if different
        if (full !== outPath) await fs.unlink(full);
      }
    }
  }
}

async function main(): Promise<void> {
  try {
    // Create the folder if it doesn't exist — avoids ENOENT on Windows
    await fs.mkdir(assetsDir, { recursive: true });
    await walk(assetsDir);
    console.log('✅ Images optimized in dist/assets/icons');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
