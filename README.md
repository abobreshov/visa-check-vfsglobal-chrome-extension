# VFS Slot Checker

A Chrome extension that monitors appointment slots on the VFS Global visa application website and sends alerts via Telegram when slots become available.

## Features

- Automatically checks for appointment slots on the VFS Global website
- Sends notifications to Telegram when slots are found
- Configurable check frequency (10-53 seconds between checks)
- Auto-refresh to prevent session timeouts
- Simple popup UI to enable/disable the checker
- Optional auto-fill of login credentials for faster testing

## Installation

### From Chrome Web Store

*Coming soon or never...*

### Manual Installation (Development)

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/vfs-slot-checker.git
   cd vfs-slot-checker
   ```

2. Install dependencies:
   ```
   cd src
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Telegram bot token and chat ID
   - Add any test credentials for development

4. Build the extension:
   ```
   npm run build
   ```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the `build/dist` directory

## Development

1. Run the development server:
   ```
   cd src
   npm run dev
   ```

2. Make changes to TypeScript files in the `src/src` directory
3. Vite will automatically rebuild the extension
4. Reload the extension from the Chrome extensions page
5. Test on the VFS Global website

## How It Works

1. The extension injects a content script into the VFS Global website
2. It automatically clicks the "View Appointment Slots" button at random intervals
3. When slots are found, it sends a notification to the configured Telegram chat
4. A browser action popup allows you to enable/disable the functionality

## Setting Up Telegram Notifications

1. Create a Telegram bot using [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Get your chat ID (you can use [@userinfobot](https://t.me/userinfobot))
4. Add these to your `.env` file

## Building for Distribution

To create a distributable version of the extension:

1. Build the project:
   ```
   cd src
   npm run build
   ```

2. Create a ZIP file for the Chrome Web Store:
   ```
   cd build/dist
   zip -r ../../vfs-slot-checker.zip *
   ```

## License

MIT

## Disclaimer

This tool is for educational purposes only. Use at your own risk and responsibility. Be aware that automated interactions with websites may violate their terms of service.