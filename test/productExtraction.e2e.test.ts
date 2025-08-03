/** @jest-environment node */

import { readFileSync } from "fs";
import path from "path";
import { loadFixture } from "./helpers/loadFixture";
import getProduct from "../src/content/getProduct";

const cases = [
  "adidas","amazon","asos","gap","gucci","hm","levi",
  "louisvuitton","nike","prada","underarmour","uniqlo",
  "versace","zara"
];

describe("getProduct() end-to-end", () => {
  test.each(cases)("end-to-end %s fixture", async site => {
    loadFixture(site);
    const result   = await getProduct();
    const expected = JSON.parse(
      readFileSync(path.join(__dirname, "golden", `${site}.json`), "utf-8")
    );
    expect(result).toMatchObject(expected);
  });
});
