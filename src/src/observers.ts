/**
 * DOM observer utilities using MutationObserver
 */
import { logTime } from './utils';

/**
 * Observer for monitoring button appearance/state changes
 */
export class ButtonObserver {
  private observer: MutationObserver | null = null;
  private clickViewInterval: NodeJS.Timeout | null = null;
  private closeButtonObserver: MutationObserver | null = null;
  
  /**
   * Observe DOM for appointment slot button appearances
   * @param onViewButtonClick Callback when View Appointment button is clicked
   */
  public observeViewButton(onViewButtonClick: () => void): void {
    // Clear any existing observers
    this.disconnect();
    
    // Use MutationObserver to monitor DOM changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const btn = Array.from(document.querySelectorAll("button"))
          .find(b => b.textContent?.includes("View Appointment Slots"));
        
        if (btn) {
          // When the button appears, click it
          (btn as HTMLButtonElement).click();
          logTime("🖱️ Clicked View Appointment Slots via observer");
          
          if (onViewButtonClick) {
            onViewButtonClick();
          }
        }
      });
    });
    
    // Observe the entire document, focusing on specific types of changes
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    logTime("👁️ Started observing for View Appointment button");
  }
  
  /**
   * Observe DOM for Close button appearances
   */
  public observeCloseButton(): void {
    // Clear any existing close button observer
    if (this.closeButtonObserver) {
      this.closeButtonObserver.disconnect();
    }
    
    this.closeButtonObserver = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const btn = Array.from(document.querySelectorAll("button"))
          .find(b => b.textContent?.trim() === "Close" && b.offsetParent !== null);
        
        if (btn) {
          setTimeout(() => {
            (btn as HTMLButtonElement).click();
            logTime("❌ Clicked Close button via observer");
          }, 3000);
        }
      });
    });
    
    // Set up observation on document body for modal dialogs
    this.closeButtonObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    logTime("👁️ Started observing for Close button");
  }
  
  /**
   * Start periodic checking as a fallback in case MutationObserver misses something
   * @param checkInterval Time between checks in milliseconds
   */
  public startPeriodicChecks(checkInterval: number = 15000): void {
    this.clickViewInterval = setInterval(() => {
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent?.includes("View Appointment Slots"));
      
      if (btn) {
        (btn as HTMLButtonElement).click();
        logTime("🖱️ Clicked View Appointment Slots via interval fallback");
      }
      
      // Also check for close buttons periodically
      const closeBtn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent?.trim() === "Close" && b.offsetParent !== null);
      
      if (closeBtn) {
        setTimeout(() => {
          (closeBtn as HTMLButtonElement).click();
          logTime("❌ Clicked Close button via interval fallback");
        }, 1000);
      }
    }, checkInterval);
    
    logTime(`⏱️ Started periodic checks every ${checkInterval/1000} seconds as fallback`);
  }
  
  /**
   * Clean up all observers and intervals when extension is disabled
   */
  public disconnect(): void {
    // Clean up the main observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      logTime("👋 Stopped observing for View Appointment button");
    }
    
    // Clean up close button observer
    if (this.closeButtonObserver) {
      this.closeButtonObserver.disconnect();
      this.closeButtonObserver = null;
      logTime("👋 Stopped observing for Close button");
    }
    
    // Clear the interval
    if (this.clickViewInterval) {
      clearInterval(this.clickViewInterval);
      this.clickViewInterval = null;
      logTime("⏱️ Stopped periodic checks");
    }
  }
}