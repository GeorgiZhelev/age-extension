# Age Counter New Tab

A Firefox extension that replaces your new tab page with a customized dashboard featuring:

- **Age Counter**: Display your age with precise decimal counting
- **Calendar & Time**: Current date, day of week, and time
- **Todo List**: Manage your tasks
- **Most Visited Sites**: Quick access to your 30 most frequently visited websites

## Features

- **Age Counter**: Shows your current age with precision to 11 decimal places, updating in real-time
- **Calendar Widget**: Displays the current month with the current day highlighted
- **Todo List**: Add, check off, and delete tasks; persists between sessions
- **Most Visited Sites**: Displays your 30 most visited sites organized in a 5×6 grid with favicons

## Development

This project uses:
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Firefox WebExtension API

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the extension
npm run build

# Package the extension for Firefox
npm run package
```

### Installation

1. Build the extension using `npm run package`
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Select the `.zip` file from the `web-ext-artifacts` directory

## Customization

- Set your birth date in `src/App.tsx` by modifying the `birthDate` state value
- Customize styling in Tailwind classes or by editing `src/index.css`
