document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme');
  const apiInput = document.getElementById('api-endpoint');
  const statusMessage = document.getElementById('status-message');

  const showMessage = (message, isError = false) => {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.classList.toggle('error', isError);
    statusMessage.classList.toggle('success', !isError);
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.classList.remove('error', 'success');
    }, 3000);
  };

  chrome.storage.sync.get(['theme', 'apiEndpoint'], ({ theme, apiEndpoint }) => {
    if (theme) {
      themeSelect.value = theme;
    }
    if (apiInput && apiEndpoint) {
      apiInput.value = apiEndpoint;
    }
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.theme) {
        const theme = changes.theme.newValue;
        if (themeSelect) themeSelect.value = theme;
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(
          theme === 'dark' ? 'theme-dark' : 'theme-light'
        );
      }
      if (changes.apiEndpoint && apiInput) {
        apiInput.value = changes.apiEndpoint.newValue;
      }
    }
  });

  document
    .getElementById('save-settings')
    .addEventListener('click', () => {
      const theme = themeSelect.value;
      const apiEndpoint = apiInput ? apiInput.value.trim() : '';
      chrome.storage.sync.set({ theme: theme, apiEndpoint }, () => {
        if (chrome.runtime.lastError) {
          showMessage('Failed to save settings. Please try again.', true);
        } else {
          showMessage('Settings saved!', false);
          document.body.classList.remove('theme-dark', 'theme-light');
          document.body.classList.add(
            theme === 'dark' ? 'theme-dark' : 'theme-light'
          );
        }
      });
    });
});
