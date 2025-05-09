import { TELEGRAM_CONFIG } from './config';

/**
 * Logs a message with a timestamp
 */
export function logTime(msg: string): void {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

/**
 * Generates a random delay between min and max values
 */
export function randomDelay(min = 10000, max = 25000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sends a message to Telegram
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CONFIG.CHAT_ID, text })
    });
  } catch (err) {
    console.warn("Telegram error:", err);
  }
}

/**
 * Simulates human-like typing in an input field
 */
export async function simulateTyping(
  el: HTMLInputElement, 
  text: string
): Promise<void> {
  el.focus();
  el.value = "";
  for (const c of text) {
    el.value += c;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
  }
}