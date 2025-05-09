/**
 * Utility functions for the extension
 */

/**
 * Logs a message with a timestamp
 * @param msg Message to log
 */
export function logTime(msg: string): void {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

/**
 * Generates a random delay between min and max values with human-like variability
 * @param min Minimum delay in milliseconds
 * @param max Maximum delay in milliseconds
 * @returns Random delay in milliseconds
 */
export function randomDelay(min = 10000, max = 25000): number {
  // Add some randomness to the distribution to make it less predictable
  const gaussian = () => {
    // Box-Muller transform for a normal distribution
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Use gaussian random to make delays more human-like
  // Centering around the middle of the range with some standard deviation
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 4; // 1/4 of the range

  // Generate random value with normal distribution
  let value = mean + gaussian() * stdDev;

  // Clamp within min-max range
  value = Math.max(min, Math.min(max, value));

  // Return as integer
  return Math.floor(value);
}

/**
 * Simulates human-like typing in an input field with natural variations
 * @param el Input element to type into
 * @param text Text to type
 */
export async function simulateTyping(
  el: HTMLInputElement,
  text: string
): Promise<void> {
  // Focus the element first
  el.focus();
  el.value = "";

  // Add variations based on character context for more realistic typing
  const getTypingDelay = (char: string, index: number) => {
    const baseDelay = 50; // Base delay in ms
    let delay = baseDelay;

    // Typing is slower at the start
    if (index < 3) {
      delay += 20;
    }

    // Add delay for special characters and uppercase (as if user has to think or press shift)
    if (/[^a-zA-Z0-9]/.test(char)) {
      delay += 30;
    } else if (/[A-Z]/.test(char)) {
      delay += 20;
    }

    // Occasionally add a longer pause (as if user is thinking)
    if (Math.random() < 0.05) {
      delay += 200;
    }

    // Add some randomness
    delay += Math.random() * 50;

    return delay;
  };

  // Type each character with a variable delay
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    el.value += char;
    el.dispatchEvent(new Event("input", { bubbles: true }));

    // Calculate and wait for the appropriate delay
    const delay = getTypingDelay(char, i);
    await new Promise(r => setTimeout(r, delay));
  }

  // Dispatch change event after typing is complete
  el.dispatchEvent(new Event("change", { bubbles: true }));
}