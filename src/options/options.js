document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme');
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

  chrome.storage.sync.get('theme', ({ theme }) => {
    if (theme) {
      themeSelect.value = theme;
    }
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  });

  document
    .getElementById('save-settings')
    .addEventListener('click', () => {
      const theme = themeSelect.value;
      chrome.storage.sync.set({ theme: theme }, () => {
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
