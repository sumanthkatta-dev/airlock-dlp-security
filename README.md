# Airlock

A Chrome extension that stops secrets and personal data from being pasted into public AI chat tools. It checks the clipboard locally and blocks the paste before anything reaches ChatGPT, Claude or Gemini.

## Screenshots

| Blocking an IP address | Blocking an API key |
|---|---|
| ![IP address blocked](./ip-preview.png) | ![API key blocked](./api-preview.png) |

## Why I built it

People paste stack traces, config files and logs into AI chats to debug faster, and keys and personal data go along with them. Company policies say "don't", but nothing actually stops it in the moment. Airlock is a guardrail at the exact point where the leak happens.

## What it detects

AWS access and secret keys · private keys (RSA, EC, OpenSSH) · JWTs · generic API keys and `password=`/`api_key=` assignments · database connection strings · email addresses · IPv4 addresses · US Social Security numbers · credit card numbers

All patterns live in [`patterns.js`](patterns.js).

## How it works

1. A content script (`content.js`) is injected at `document_start` on chatgpt.com, claude.ai and gemini.google.com.
2. It listens for `paste` events and runs the clipboard text through the regex patterns.
3. On a match it cancels the paste and shows an alert naming what was detected.
4. The background service worker (`background.js`) handles browser notifications and a right-click menu.

Everything runs locally. The extension makes no network requests.

## Try it

1. Clone the repo, open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick the folder.
2. Open ChatGPT, Claude or Gemini and try pasting one of these fake values:

```text
AKIAIOSFODNN7EXAMPLE
```
```text
-----BEGIN RSA PRIVATE KEY-----
```
```text
192.168.0.154
```

The paste should be blocked and an alert should name what was caught.

## Tech stack

JavaScript · Chrome Extensions Manifest V3 (content scripts, service worker, contextMenus, notifications)

## Roadmap

- Let users allow-list specific values
- Mask the sensitive part and paste the rest, instead of blocking the whole paste
- Configurable list of protected sites
