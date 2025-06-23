document.getElementById("save-settings").addEventListener("click", () => {
  const theme = document.getElementById("theme").value;
  chrome.storage.sync.set({ theme: theme }, () => {
    if (chrome.runtime.lastError) {
      alert("Failed to save settings. Please try again.");
    } else {
      alert("Settings saved!");
    }
  });
});
