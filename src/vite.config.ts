import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { loadEnv } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, beta)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [crx({ manifest })],
    build: {
      outDir: '../build/dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: 'popup.html',
        },
      },
    },
    define: {
      // Make env variables available in the client code
      'process.env.TELEGRAM_BOT_TOKEN': JSON.stringify(env.TELEGRAM_BOT_TOKEN),
      'process.env.TELEGRAM_CHAT_ID': JSON.stringify(env.TELEGRAM_CHAT_ID),
      'process.env.TEST_EMAIL': JSON.stringify(env.TEST_EMAIL),
      'process.env.TEST_PASSWORD': JSON.stringify(env.TEST_PASSWORD),
    },
  };
});