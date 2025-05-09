import { APP_CONFIG } from './config';
import { logTime, randomDelay, sendTelegramMessage, simulateTyping } from './utils';

// Store extension state with Chrome storage API
chrome.storage.local.get("enabled", (data) => {
  if (!data.enabled) {
    console.log("🚫 VFS Slot Checker is disabled.");
    return;
  }

  (async function main() {
    // Prevent multiple instances
    if (window.__vfsSlotCheckerLoaded) {
      console.log("🚫 Script already loaded.");
      return;
    }
    // Set global flag to indicate the script is loaded
    (window as any).__vfsSlotCheckerLoaded = true;

    /**
     * Attempts to find and click the "View Appointment Slots" button
     */
    function tryClickView(): void {
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent?.includes("View Appointment Slots"));
      if (btn) {
        (btn as HTMLButtonElement).click();
        logTime("🖱️ Clicked View Appointment Slots");
      }
    }

    /**
     * Attempts to find and click the "Close" button
     */
    function tryClickClose(): void {
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent?.trim() === "Close" && b.offsetParent !== null);
      if (btn) {
        setTimeout(() => {
          (btn as HTMLButtonElement).click();
          logTime("❌ Clicked Close button");
        }, 3000);
      }
    }

    /**
     * Autofills login credentials for faster testing
     */
    async function autofillCredentials(): Promise<void> {
      const start = Date.now();
      while (Date.now() - start < 10000) {
        const email = document.getElementById("email") as HTMLInputElement;
        const pass = document.getElementById("password") as HTMLInputElement;
        if (email && pass) {
          await simulateTyping(email, APP_CONFIG.TEST_CREDENTIALS.EMAIL);
          await simulateTyping(pass, APP_CONFIG.TEST_CREDENTIALS.PASSWORD);
          break;
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Autofill credentials and notify that the checker has started
    await autofillCredentials();
    await sendTelegramMessage("✅ VFS slot checker started.");

    /**
     * Schedules the next click on the View Appointments button
     */
    function scheduleViewClick(): void {
      const delay = randomDelay(APP_CONFIG.CLICK_DELAY.MIN, APP_CONFIG.CLICK_DELAY.MAX);
      logTime(`⏳ Waiting ${Math.round(delay / 1000)}s until next View click`);
      setTimeout(() => {
        try {
          tryClickView();
        } catch (err) {
          console.error("Slot check error:", err);
        }
        scheduleViewClick();
      }, delay);
    }

    // Start the slot checking process
    scheduleViewClick();
    
    // Regularly check for and close any modal dialogs
    setInterval(tryClickClose, 5000);

    // Reload the page periodically to avoid session timeouts
    setTimeout(() => {
      logTime("♻️ Reloading...");
      sendTelegramMessage("♻️ Reloading the page.");
      location.reload();
    }, APP_CONFIG.RELOAD_TIMEOUT);
  })();
});