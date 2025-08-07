import { Look } from '../lookbook/store';

interface LookLinksStore {
  lookLinks?: Record<string, Look>;
}

export function createLookLink(look: Look): string {
  const storage = chrome.storage.local as unknown as LookLinksStore;
  const links = storage.lookLinks || {};
  links[look.id] = look;
  storage.lookLinks = links;
  return chrome.runtime.getURL('look.html#' + look.id);
}
