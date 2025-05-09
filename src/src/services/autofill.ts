/**
 * Service for handling credential autofill operations
 */
import { APP_CONFIG } from '../config';
import { logTime, simulateTyping } from '../utils';

export class AutofillService {
  /**
   * Attempts to find and fill the login form
   * @returns Promise that resolves when autofill is complete or times out
   */
  public async autofillCredentials(): Promise<boolean> {
    const { EMAIL, PASSWORD } = APP_CONFIG.TEST_CREDENTIALS;
    
    if (!EMAIL || !PASSWORD) {
      logTime("⚠️ Test credentials not configured in .env file");
      return false;
    }
    
    const start = Date.now();
    const maxWaitTime = 10000; // 10 seconds
    let fillSuccessful = false;
    
    // Wait for form elements to appear with timeout
    while (Date.now() - start < maxWaitTime) {
      try {
        const email = document.getElementById("email") as HTMLInputElement;
        const pass = document.getElementById("password") as HTMLInputElement;
        
        if (email && pass) {
          // Fill email field
          await simulateTyping(email, EMAIL);
          logTime("✏️ Filled email/reference field");
          
          // Fill password field
          await simulateTyping(pass, PASSWORD);
          logTime("✏️ Filled password field");
          
          fillSuccessful = true;
          break;
        }
      } catch (err) {
        logTime(`⚠️ Autofill error: ${err}`);
      }
      
      // Wait a bit before trying again
      await new Promise(r => setTimeout(r, 500));
    }
    
    if (fillSuccessful) {
      logTime("✅ Autofill completed successfully");
    } else {
      logTime("⚠️ Autofill timed out, login form not found");
    }
    
    return fillSuccessful;
  }
  
  /**
   * Attempts to automatically submit the login form after filling credentials
   * @returns Promise that resolves when form is submitted or fails
   */
  public async submitLoginForm(): Promise<boolean> {
    try {
      // Find the submit button
      const submitBtn = Array.from(document.querySelectorAll("button"))
        .find(b => 
          b.textContent?.includes("Sign In") || 
          b.textContent?.includes("Login") ||
          b.type === "submit"
        );
      
      if (submitBtn) {
        (submitBtn as HTMLButtonElement).click();
        logTime("🖱️ Clicked login button");
        return true;
      }
    } catch (err) {
      logTime(`❌ Error submitting login form: ${err}`);
    }
    
    return false;
  }
}