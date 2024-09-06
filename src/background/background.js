chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else {
    chrome.action.onClicked.addListener(() => {
      chrome.action.setPopup({ popup: "src/popup/popup.html" });
      chrome.windows.create({
        url: "popup.html",
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
    function: checkAndOpenTab,
  });
});

function checkAndOpenTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const isStore = isOnlineStore(url);
    if (isStore) {
      document.getElementById("home-tab").click();
    } else {
      document.getElementById("store-discovery-tab").click();
    }
  });

  function isOnlineStore(url) {
    const onlineStoreDomains = ["example-store.com", "another-store.com"];
    return onlineStoreDomains.some((domain) => url.hostname.includes(domain));
  }
}
