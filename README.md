# Mute: AI Security Guardrail

Chrome Extension to prevent accidental pasting of sensitive data into AI chat interfaces.

## Installation

1. Create icon files in the `icons/` folder:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. Open Chrome and navigate to `chrome://extensions`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked"

5. Select the `mute` folder

6. The extension should now be active on ChatGPT, Claude, and Gemini

## Testing

Open the browser console (F12) on any of the supported AI sites and verify:
- You see the message: "Mute is active on: [domain]"

## File Structure

```
mute/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Background service worker
├── content.js            # Content script for paste monitoring
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Development Phases

- ✅ Phase 1: Project Setup & Manifest
- ⏳ Phase 2: Security Patterns (Regex Library)
- ⏳ Phase 3: Paste Event Listener & Blocker
- ⏳ Phase 4: Advanced Features & Context Menu
