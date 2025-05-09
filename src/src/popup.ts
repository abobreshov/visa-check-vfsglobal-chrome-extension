/**
 * Popup UI for controlling the extension
 */

/**
 * Class to handle popup UI and interactions
 */
class PopupManager {
  private statusEl: HTMLElement | null;
  private toggleBtn: HTMLElement | null;
  private currentTab: chrome.tabs.Tab | null = null;

  constructor() {
    this.statusEl = document.getElementById('status');
    this.toggleBtn = document.getElementById('toggleBtn');
  }

  /**
   * Initialize the popup
   */
  public async init(): Promise<void> {
    if (!this.statusEl || !this.toggleBtn) {
      console.error("Required UI elements not found");
      return;
    }

    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tabs[0];

      if (!this.currentTab?.id) {
        console.error("No active tab found");
        return;
      }

      // Set up event listeners
      this.setupEventListeners();

      // Initialize UI state
      await this.initializeState();
    } catch (error) {
      console.error("Error initializing popup:", error);
    }
  }

  /**
   * Set up event listeners for UI elements
   */
  private setupEventListeners(): void {
    if (!this.toggleBtn) return;

    this.toggleBtn.addEventListener('click', async () => {
      await this.toggleExtension();
    });
  }

  /**
   * Initialize UI state based on storage and content script state
   */
  private async initializeState(): Promise<void> {
    if (!this.currentTab?.id) return;

    try {
      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        files: ['src/content.js']
      });

      // Get current state from storage
      const data = await this.getStorageData("enabled");
      const isEnabled = !!data.enabled;

      // Update UI to match current state
      this.updateUI(isEnabled);

      // Make sure content script is aware of the state
      await this.sendMessageToContentScript({
        type: "toggle-checker",
        enabled: isEnabled
      });
    } catch (error) {
      console.error("Error initializing state:", error);
      this.updateUI(false);
    }
  }

  /**
   * Toggle the extension state
   */
  private async toggleExtension(): Promise<void> {
    if (!this.currentTab?.id || !this.toggleBtn) return;

    try {
      // Determine desired state based on button text
      const enable = this.toggleBtn.textContent?.includes('Enable') || false;

      // Update UI immediately for better responsiveness
      this.updateUI(enable);

      // Update storage
      await chrome.storage.local.set({ enabled: enable });

      // Notify content script of state change
      await this.sendMessageToContentScript({
        type: "toggle-checker",
        enabled: enable
      });

      // Reload the page to apply changes if enabling
      if (enable) {
        await chrome.tabs.reload(this.currentTab.id);
      }
    } catch (error) {
      console.error("Error toggling extension:", error);
    }
  }

  /**
   * Update icon and UI elements to reflect the current state
   */
  private updateUI(enabled: boolean): void {
    if (!this.statusEl || !this.toggleBtn || !this.currentTab?.id) return;

    // Update UI text
    this.statusEl.textContent = enabled ? '✅ Enabled' : '⛔ Disabled';
    this.toggleBtn.textContent = enabled ? 'Disable Checker' : 'Enable Checker';

    // Update icon
    chrome.action.setIcon({
      tabId: this.currentTab.id,
      path: enabled ? 'vfs_telegram_icon_48_enabled.png' : 'vfs_telegram_icon_48_disabled.png'
    });
  }

  /**
   * Send a message to the content script
   */
  private async sendMessageToContentScript(message: any): Promise<any> {
    if (!this.currentTab?.id) return;

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(this.currentTab!.id!, message, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Helper function to get Chrome storage data as a Promise
   */
  private getStorageData(key: string): Promise<any> {
    return new Promise(resolve => {
      chrome.storage.local.get(key, (data) => {
        resolve(data);
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const popupManager = new PopupManager();
  await popupManager.init();
});