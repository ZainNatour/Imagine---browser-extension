import { isOnlineStore } from "./modules/urlUtils.js";

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

chrome.tabs.onCreated.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length || !tabs[0].url) return;
    const url = new URL(tabs[0].url);
    const target = isOnlineStore(url) ? "home-tab" : "store-discovery-tab";
    chrome.runtime.sendMessage({ action: "selectTab", target });
  });
});
