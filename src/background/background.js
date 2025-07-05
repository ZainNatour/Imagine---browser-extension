import { isOnlineStore, loadStoreDomains } from "./modules/urlUtils.js";
import { addToWishlist } from "../popup/modules/wishlist.js";

function createContextMenus() {
  if (!chrome.contextMenus) return;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'imagine-try-on',
      title: 'Try on with Imagine',
      contexts: ['image'],
    });
    chrome.contextMenus.create({
      id: 'imagine-add-wishlist',
      title: 'Add to Imagine Wishlist',
      contexts: ['image'],
    });
  });
}

createContextMenus();
chrome.runtime.onStartup.addListener(createContextMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'imagine-try-on') {
    const notifyPanel = () =>
      chrome.runtime.sendMessage({ action: 'contextTryOn', srcUrl: info.srcUrl });

    if (chrome.sidePanel && chrome.sidePanel.open) {
      // Open the extension side panel if supported
      chrome.sidePanel.open({ windowId: tab?.windowId }, notifyPanel);
    } else {
      // Fallback: open the popup window
      chrome.windows.create(
        {
          url: chrome.runtime.getURL('src/popup/popup.html'),
          type: 'popup',
          width: 400,
          height: 600,
        },
        notifyPanel,
      );
    }
  } else if (info.menuItemId === 'imagine-add-wishlist') {
    const pageUrl = info.pageUrl || (tab && tab.url) || '';
    addToWishlist({
      name: '',
      price: '',
      clothingType: '',
      imageSrc: info.srcUrl,
      url: pageUrl,
      storeName: pageUrl ? new URL(pageUrl).hostname.replace(/^www\./, '') : '',
    });
  }
});

// Warm up the domain cache when the service worker starts
loadStoreDomains();

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else {
    chrome.action.onClicked.addListener(() => {
      chrome.action.setPopup({ popup: "src/popup/popup.html" });
      chrome.windows.create({
        url: "src/popup/popup.html",
        type: "popup",
        width: 400,
        height: 600,
      });
    });
  }

  createContextMenus();
});

chrome.tabs.onCreated.addListener((tab) => {
  const handleTabUrl = async (urlString) => {
    const url = new URL(urlString);
    const target = (await isOnlineStore(url))
      ? "home-tab"
      : "store-discovery-tab";
    chrome.runtime.sendMessage({ action: "selectTab", target });
  };

  if (tab && tab.url) {
    handleTabUrl(tab.url);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length && tabs[0].url) {
        handleTabUrl(tabs[0].url);
      }
    });
  }
});
