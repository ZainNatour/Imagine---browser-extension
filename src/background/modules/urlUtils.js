import { STORES_DATA_PATH } from "../../shared/constants.js";
let cachedDomains = null;

export async function loadStoreDomains() {
  if (cachedDomains) {
    return cachedDomains;
  }
  try {
    const response = await fetch(chrome.runtime.getURL(STORES_DATA_PATH));
    const stores = await response.json();
    cachedDomains = stores.map((store) =>
      new URL(store.url).hostname.replace(/^www\./, "")
    );
  } catch (error) {
    console.error("Failed to load store domains", error);
    cachedDomains = [];
  }
  return cachedDomains;
}

export async function isOnlineStore(url) {
  const onlineStoreDomains = await loadStoreDomains();
  const host = url.hostname.replace(/^www\./, "");
  return onlineStoreDomains.some((domain) => host.includes(domain));
}
