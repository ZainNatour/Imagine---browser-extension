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

chrome.tabs.onCreated.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: checkAndOpenTab,
  });
});

function checkAndOpenTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    if (isOnlineStore(url)) {
      document.getElementById("home-tab").click();
    } else {
      document.getElementById("store-discovery-tab").click();
    }
  });
}
