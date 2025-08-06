import { execSync } from 'node:child_process';

jest.setTimeout(60000);

describe('bundle size', () => {
  it('gzipped bundle is under 2MB', () => {
    execSync('npm run build', { stdio: 'inherit' });
    const output = execSync('npm run -s size:gzip').toString().trim();
    const size = parseInt(output.split(/\s+/).pop() || '0', 10);
    expect(size).toBeLessThanOrEqual(2 * 1024 * 1024);
  });
});
