document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme');
  chrome.storage.sync.get('theme', ({ theme }) => {
    if (theme) {
      themeSelect.value = theme;
    }
  });

  document
    .getElementById('save-settings')
    .addEventListener('click', () => {
      const theme = themeSelect.value;
      chrome.storage.sync.set({ theme: theme }, () => {
        if (chrome.runtime.lastError) {
          alert('Failed to save settings. Please try again.');
        } else {
          alert('Settings saved!');
        }
      });
    });
});
