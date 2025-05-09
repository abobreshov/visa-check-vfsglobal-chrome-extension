/**
 * Telegram notification service with retry logic
 */
import { TELEGRAM_CONFIG } from '../config';
import { logTime } from '../utils';

interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: any;
}

export class TelegramService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // milliseconds

  /**
   * Send a message to Telegram with automatic retry
   * @param text Message text to send
   * @returns Promise that resolves when message is sent or all retries are exhausted
   */
  public async sendMessage(text: string): Promise<boolean> {
    let currentTry = 0;
    
    while (currentTry < this.MAX_RETRIES) {
      try {
        // If this is a retry, log it
        if (currentTry > 0) {
          logTime(`🔄 Retrying Telegram send (attempt ${currentTry + 1}/${this.MAX_RETRIES})`);
        }
        
        const response = await this.sendTelegramRequest(text);
        
        if (response.ok) {
          if (currentTry > 0) {
            logTime(`✅ Telegram message sent successfully after ${currentTry + 1} attempts`);
          }
          return true;
        } else {
          logTime(`⚠️ Telegram API returned error: ${response.description}`);
          
          // Increment retry counter
          currentTry++;
          
          // If we have more retries, wait before the next attempt
          if (currentTry < this.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
          }
        }
      } catch (error) {
        logTime(`❌ Telegram send error: ${error}`);
        
        // Increment retry counter
        currentTry++;
        
        // If we have more retries, wait before the next attempt
        if (currentTry < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }
    
    logTime(`❌ Failed to send Telegram message after ${this.MAX_RETRIES} attempts`);
    return false;
  }
  
  /**
   * Make the actual request to Telegram API
   * @param text Message text to send
   * @returns Promise with Telegram API response
   */
  private async sendTelegramRequest(text: string): Promise<TelegramResponse> {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: TELEGRAM_CONFIG.CHAT_ID, 
        text,
        parse_mode: 'HTML' // Enable HTML formatting in messages
      })
    });
    
    return await response.json();
  }
}