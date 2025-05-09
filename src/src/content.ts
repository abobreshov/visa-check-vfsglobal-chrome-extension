import { APP_CONFIG } from './config';
import { logTime, randomDelay } from './utils';
import { TelegramService } from './services/telegram';
import { AutofillService } from './services/autofill';
import { ButtonObserver } from './observers';

/**
 * Main class for VFS Slot Checker functionality
 */
class SlotChecker {
  private readonly telegramService: TelegramService;
  private readonly autofillService: AutofillService;
  private readonly buttonObserver: ButtonObserver;
  private reloadTimeout: NodeJS.Timeout | null = null;
  private isEnabled = false;

  constructor() {
    this.telegramService = new TelegramService();
    this.autofillService = new AutofillService();
    this.buttonObserver = new ButtonObserver();
  }

  /**
   * Initialize the slot checker
   */
  public async init(): Promise<void> {
    // Check if extension is enabled via Chrome storage
    const data = await this.getStorageData("enabled");
    this.isEnabled = !!data.enabled;

    if (!this.isEnabled) {
      logTime("🚫 VFS Slot Checker is disabled.");
      return;
    }

    // Prevent multiple instances
    if (window.__vfsSlotCheckerLoaded) {
      logTime("🚫 Script already loaded.");
      return;
    }

    // Set global flag to indicate the script is loaded
    window.__vfsSlotCheckerLoaded = true;

    // Start the checker
    await this.start();
  }

  /**
   * Start the slot checking process
   */
  private async start(): Promise<void> {
    try {
      // Autofill credentials
      await this.autofillService.autofillCredentials();

      // Notify that the checker has started
      await this.telegramService.sendMessage("✅ VFS slot checker started.");

      // Set up button observers with MutationObserver
      this.setupObservers();

      // Schedule page reload to avoid session timeouts
      this.schedulePageReload();

      logTime("✅ Slot checker initialized successfully");
    } catch (error) {
      logTime(`❌ Error starting slot checker: ${error}`);
    }
  }

  /**
   * Set up MutationObservers and fallback intervals
   */
  private setupObservers(): void {
    // Set up button click observer
    this.buttonObserver.observeViewButton(async () => {
      // This callback runs when the View button is clicked
      // Here you could add logic to detect if slots were found
    });

    // Set up close button observer
    this.buttonObserver.observeCloseButton();

    // Start periodic checks as fallback (less frequent than before)
    this.buttonObserver.startPeriodicChecks(30000); // Check every 30 seconds as fallback

    // Schedule the first deliberate click with random delay
    this.scheduleNextClick();
  }

  /**
   * Schedule the next deliberate button click
   */
  private scheduleNextClick(): void {
    const delay = randomDelay(APP_CONFIG.CLICK_DELAY.MIN, APP_CONFIG.CLICK_DELAY.MAX);
    logTime(`⏳ Scheduling next deliberate click in ${Math.round(delay / 1000)}s`);

    setTimeout(() => {
      if (!this.isEnabled) return;

      try {
        // Find and click view button manually
        const btn = Array.from(document.querySelectorAll("button"))
          .find(b => b.textContent?.includes("View Appointment Slots"));

        if (btn) {
          (btn as HTMLButtonElement).click();
          logTime("🖱️ Clicked View Appointment Slots (scheduled)");
        }
      } catch (err) {
        logTime(`❌ Error in scheduled click: ${err}`);
      }

      // Schedule the next click
      this.scheduleNextClick();
    }, delay);
  }

  /**
   * Schedule page reload to prevent session timeouts
   */
  private schedulePageReload(): void {
    this.reloadTimeout = setTimeout(async () => {
      logTime("♻️ Reloading page...");
      await this.telegramService.sendMessage("♻️ Reloading the page.");
      location.reload();
    }, APP_CONFIG.RELOAD_TIMEOUT);
  }

  /**
   * Clean up all resources when the checker is disabled
   */
  public cleanup(): void {
    this.isEnabled = false;

    // Clean up observers and intervals
    this.buttonObserver.disconnect();

    // Clear reload timeout
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout);
      this.reloadTimeout = null;
    }

    logTime("🧹 Slot checker resources cleaned up");
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

// Initialize the slot checker when content script loads
const slotChecker = new SlotChecker();
slotChecker.init().catch(error => {
  logTime(`❌ Error initializing slot checker: ${error}`);
});

// Listen for enable/disable messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "toggle-checker") {
    if (message.enabled) {
      slotChecker.init().then(() => sendResponse({ success: true }));
    } else {
      slotChecker.cleanup();
      sendResponse({ success: true });
    }
    return true;
  }
});