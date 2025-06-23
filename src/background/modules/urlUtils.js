export function isOnlineStore(url) {
  const onlineStoreDomains = ["example-store.com", "another-store.com"];
  return onlineStoreDomains.some((domain) => url.hostname.includes(domain));
}
