# Airlock 🛡️🔒

![Category](https://img.shields.io/badge/Category-Enterprise_Security-red?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Chrome_Manifest_V3-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Protection-Active-success?style=for-the-badge)

> **Data Loss Prevention (DLP) Sentry:** A browser-based security middleware that intercepts and blocks sensitive data (API Keys, PII) before it enters public AI models.

## 🖼️ Security in Action
### 1. Blocking IP Leakage
![IP address blocked](./ip-preview.png)

### 2. Blocking API Key Leakage
![API key blocked](./api-preview.png)
*(Snapshot: Airlock detecting sensitive patterns and blocking the paste action on ChatGPT)*

## 🚨 The Problem: "Shadow AI"
Employees frequently paste sensitive company data into public LLMs (ChatGPT, Claude, Gemini) for quick debugging. This leads to:
* **Data Leaks:** Private keys and customer PII entering public training data.
* **Compliance Violations:** Breaches of GDPR, SOC2, and internal security protocols.

## 🛡️ The Solution
Airlock runs locally as a "Security Sentry" between your clipboard and the browser DOM.
1.  **Intercept:** Listens for `paste` events specifically on AI domains.
2.  **Analyze:** Instantly runs a local Regex engine to scan for threat patterns.
3.  **Block:** If a threat (e.g., `sk-live-...`) is detected, the event is hard-blocked at the DOM level.

## ⚙️ Technical Implementation
* **Manifest V3:** Built on the latest secure Chrome Extension architecture using Service Workers.
* **Regex Engine:** Zero-latency client-side pattern matching for:
    * AWS Access Keys (`AKIA...`)
    * Private RSA Keys
    * IPv4/IPv6 Addresses
    * Social Security / Aadhar formats
* **Privacy First:** Analysis happens 100% locally. No data ever leaves the browser.

---

## 🧪 Test It Yourself
Want to see the blocking in action? Copy any of these "Dummy Secrets" below and try to paste them into ChatGPT or Claude while the extension is running.

**1. Fake AWS Access Key (Matches `AKIA...` pattern)**
```text
AKIAIMNOTREALKEYEXAMPLE

```

**2. Fake Private RSA Key (Matches `-----BEGIN...` pattern)**

```text
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA3Tz2mr7SZiAMfQyuvBjM9Oi..
-----END RSA PRIVATE KEY-----

```

**3. Internal IP Address (Matches IPv4 pattern)**

```text
192.168.0.154

```

> **Expected Result:** The paste action will be blocked, and you will see the Airlock Security Alert banner.

---

## 📂 File Structure

```text
airlock/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Background service worker
├── content.js             # Content script for paste monitoring
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file

```

## 🛠️ Development Phases

* ✅ **Phase 1:** Project Setup & Manifest
* ✅ **Phase 2:** Security Patterns (Regex Library)
* ✅ **Phase 3:** Paste Event Listener & Blocker
* ⏳ **Phase 4:** Advanced Features & Context Menu

---

*Developed by Sumanth Katta | Jan 2026*

```

