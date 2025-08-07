import type { Plugin } from 'vite';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export default function stripBigIcons(): Plugin {
  let outDir = 'dist';
  return {
    name: 'strip-big-icons',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = config.build.outDir || outDir;
    },
    async closeBundle() {
      const iconDir = path.join(outDir, 'src/assets/icons');
      const placeholder = '<svg xmlns="http://www.w3.org/2000/svg"/>';
      try {
        const files = await fs.readdir(iconDir);
        await Promise.all(
          files
            .filter((f) => /^icon.*\.(?:webp|png)$/.test(f))
            .map(async (f) => {
              const filePath = path.join(iconDir, f);
              const stat = await fs.stat(filePath);
              if (stat.size > 32 * 1024) {
                await fs.writeFile(filePath, placeholder);
              }
            })
        );
      } catch {
        // ignore if directory not found
      }
    },
  };
}
