/**
 * Popup UI for controlling the extension
 */
document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const toggleBtn = document.getElementById('toggleBtn');
  if (!statusEl || !toggleBtn) return;

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return;

  /**
   * Updates the extension icon
   */
  const setIcon = (enabled: boolean): void => {
    chrome.action.setIcon({
      tabId: tab.id!,
      path: enabled ? 'vfs_telegram_icon_48_enabled.png' : 'vfs_telegram_icon_48_disabled.png'
    });
  };

  /**
   * Updates the UI to reflect the current state
   */
  const updateUI = (running: boolean): void => {
    if (statusEl) statusEl.textContent = running ? '✅ Enabled' : '⛔ Disabled';
    if (toggleBtn) toggleBtn.textContent = running ? 'Disable Checker' : 'Enable Checker';
    setIcon(running);
  };

  // Inject content script
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['src/content.js']
  });

  // Check if the extension is already running
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      if (typeof (window as any).__VFS_RUNNING__ === 'undefined') {
        (window as any).__VFS_RUNNING__ = true;
      }
      return (window as any).__VFS_RUNNING__;
    }
  }, (results) => {
    const isRunning = results?.[0]?.result === true;
    updateUI(isRunning);
    
    // Update storage with current state
    chrome.storage.local.set({ enabled: isRunning });
  });

  // Handle toggle button click
  toggleBtn.addEventListener('click', () => {
    const enable = toggleBtn.textContent?.includes('Enable') || false;
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: (enable) => {
        (window as any).__VFS_RUNNING__ = enable;
        return enable;
      },
      args: [enable]
    }, (results) => {
      const nowRunning = results?.[0]?.result === true;
      updateUI(nowRunning);
      
      // Update storage with new state
      chrome.storage.local.set({ enabled: nowRunning });
      
      // Reload the page to apply changes
      if (nowRunning) {
        chrome.tabs.reload(tab.id!);
      }
    });
  });
});