document.getElementById("save-settings").addEventListener("click", () => {
  const theme = document.getElementById("theme").value;
  chrome.storage.sync.set({ theme: theme }, () => {
    alert("Settings saved!");
  });
});
