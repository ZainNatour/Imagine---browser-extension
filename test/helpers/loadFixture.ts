import { readFileSync } from "fs";
import { JSDOM } from "jsdom";
export function loadFixture(name: string) {
  const html = readFileSync(`test/html/${name}.html`, "utf-8");
  const dom  = new JSDOM(html, { url: `https://${name}.com` });
  global.window   = dom.window as any;
  global.document = dom.window.document as any;
}
