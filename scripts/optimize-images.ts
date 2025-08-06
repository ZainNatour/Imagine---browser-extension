import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.resolve('src/assets');
const threshold = 0; // always optimize

interface Mapping { old: string; webp: string; }
const mappings: Mapping[] = [];

async function walk(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const iconMatch = entry.name.match(/^icon(\d+)/);
      if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const webpPath = full.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const size = iconMatch ? parseInt(iconMatch[1], 10) : 256;
        await sharp(full)
          .resize(size, size, { fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(webpPath);
        await fs.unlink(full);
        mappings.push({ old: path.basename(full), webp: path.basename(webpPath) });
      } else if (ext === '.webp') {
        const size = iconMatch ? parseInt(iconMatch[1], 10) : 256;
        const tmp = full + '.tmp';
        await sharp(full)
          .resize(size, size, { fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(tmp);
        await fs.unlink(full);
        await fs.rename(tmp, full);
      }
    }
  }
}

async function updateReferences(): Promise<void> {
  const textExts = ['.html', '.tsx', '.ts', '.js', '.jsx', '.mjs'];
  async function scan(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scan(full);
      } else if (textExts.includes(path.extname(entry.name))) {
        let content = await fs.readFile(full, 'utf8');
        let updated = content;
        for (const { old, webp } of mappings) {
          updated = updated.split(old).join(webp);
        }
        if (updated !== content) {
          await fs.writeFile(full, updated, 'utf8');
        }
      }
    }
  }
  await scan(path.resolve('src'));

  // Update manifest.json references
  const manifestPath = path.resolve('manifest.json');
  try {
    let content = await fs.readFile(manifestPath, 'utf8');
    let updated = content;
    for (const { old, webp } of mappings) {
      updated = updated.split(old).join(webp);
    }
    if (updated !== content) {
      await fs.writeFile(manifestPath, updated, 'utf8');
    }
  } catch {
    // ignore if manifest doesn't exist
  }
}

async function main(): Promise<void> {
  await walk(assetsDir);
  if (mappings.length > 0) {
    await updateReferences();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
