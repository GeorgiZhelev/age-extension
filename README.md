# Age Counter New Tab

A browser extension that replaces your new tab page with a customized dashboard featuring:

- **Age Counter**: Display your age with precise decimal counting
- **Calendar & Time**: Current date, day of week, and time
- **Todo List**: Manage your tasks
- **Most Visited Sites**: Quick access to your most frequently visited websites
- **Habit Tracker**: Track and visualize your daily habits

> **Note**: This extension works completely offline, with the only external network requests being to DuckDuckGo for website favicons. I've only tested on Firefox and Chrome, but it should work on other Chromium based browsers too. Should ™️

## Features

- **Age Counter**: Shows your current age with precision to 11 decimal places, updating in real-time
- **Calendar Widget**: Displays the current month with the current day highlighted
- **Todo List**: Add, check off, and delete tasks; persists between sessions
- **Most Visited Sites**: Displays your 30 most visited sites organized in a 5×6 grid with favicons
- **Habit Tracker**: Track and visualize your daily habits, streaks, cumulative completions etc.

## Development

This project uses:
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- WebExtension API 

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build the extension
npm run build

# Package the extension
npm run package
```

### Installation

#### Firefox
1. Build the extension using `npm run package`
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Browse to the extension directory and select the `manifest.json` file

#### Chrome
1. Build the extension using `npm run package`
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked"
5. Browse to and select the extension's build directory

