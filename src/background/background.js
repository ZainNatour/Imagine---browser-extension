import { isOnlineStore, loadStoreDomains } from "./modules/urlUtils.js";

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
