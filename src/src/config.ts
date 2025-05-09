// Configuration variables for the extension
export const TELEGRAM_CONFIG = {
  // Use environment variables from the.env file
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
};

export const APP_CONFIG = {
  // Time to reload the page (25 minutes in milliseconds)
  RELOAD_TIMEOUT: 25 * 60 * 1000,
  // Random delay for checking slots
  CLICK_DELAY: {
    MIN: 10000, // 10 seconds
    MAX: 53000, // 53 seconds
  },
  // Testing credentials for development from .env file
  TEST_CREDENTIALS: {
    EMAIL: process.env.TEST_EMAIL || '',
    PASSWORD: process.env.TEST_PASSWORD || '',
  }
};