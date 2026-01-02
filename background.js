// Airlock: AI Security Sentry - Background Service Worker
// Author: Sumanth Katta
// This script runs in the background and handles cross-origin requests,
// context menus, notifications, and communication with content scripts

console.log('🔒 Airlock Background Service Started');

/**
 * SENSITIVE_PATTERNS - Duplicated here for context menu scanning
 * (Service workers can't easily import from content scripts)
 */
const SENSITIVE_PATTERNS = {
  ipv4: {
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    name: 'IPv4 Address',
    description: 'Internal IP address detected'
  },
  awsAccessKey: {
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    name: 'AWS Access Key',
    description: 'AWS Access Key ID detected'
  },
  awsSecretKey: {
    regex: /\b([A-Za-z0-9/+=]{40})\b/g,
    name: 'AWS Secret Key',
    description: 'Possible AWS Secret Access Key detected'
  },
  privateKey: {
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    name: 'Private Key',
    description: 'Private cryptographic key detected'
  },
  email: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    name: 'Email Address',
    description: 'Email address detected (may contain PII)'
  },
  secretAssignment: {
    regex: /\b(password|passwd|pwd|secret|api[_-]?key|auth[_-]?token|access[_-]?token|private[_-]?key)\s*[:=]\s*["']?([^\s"']+)["']?/gi,
    name: 'Secret Assignment',
    description: 'Credential or secret assignment detected'
  },
  genericApiKey: {
    regex: /\b[A-Za-z0-9_-]{32,}\b/g,
    name: 'API Key',
    description: 'Possible API key or token detected'
  },
  jwtToken: {
    regex: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\b/g,
    name: 'JWT Token',
    description: 'JSON Web Token detected'
  },
  databaseUrl: {
    regex: /\b(mongodb|postgresql|mysql|postgres|redis):\/\/[^\s]+/gi,
    name: 'Database Connection String',
    description: 'Database connection URL detected'
  },
  ssn: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    name: 'Social Security Number',
    description: 'US Social Security Number detected (PII)'
  },
  creditCard: {
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    name: 'Credit Card Number',
    description: 'Credit card number detected (PII)'
  }
};

/**
 * scanText - Scans text against all patterns
 */
function scanTextInBackground(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  for (const [key, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    pattern.regex.lastIndex = 0;
    const matches = text.match(pattern.regex);
    
    if (matches && matches.length > 0) {
      return {
        patternKey: key,
        patternName: pattern.name,
        description: pattern.description,
        matchCount: matches.length,
        detected: true
      };
    }
  }

  return null;
}

/**
 * EXTENSION INSTALLATION - Create context menu
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✅ Airlock extension installed successfully');
  } else if (details.reason === 'update') {
    console.log('🔄 Airlock extension updated to version', chrome.runtime.getManifest().version);
  }

  // Create context menu item for text selection scanning
  chrome.contextMenus.create({
    id: 'scan-selection',
    title: '� Airlock: Scan Selection for Secrets',
    contexts: ['selection']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating context menu:', chrome.runtime.lastError);
    } else {
      console.log('✅ Context menu "Scan Selection" created');
    }
  });
});

/**
 * CONTEXT MENU CLICK HANDLER - Scan selected text
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scan-selection') {
    const selectedText = info.selectionText;

    console.log('🔍 Scanning selected text:', selectedText?.substring(0, 50) + '...');

    if (!selectedText || selectedText.trim().length === 0) {
      showNotification('⚠️ No Text Selected', 'Please select some text to scan.', 'warning');
      return;
    }

    // Scan the selected text
    const scanResult = scanTextInBackground(selectedText);

    if (scanResult && scanResult.detected) {
      // DANGER: Sensitive data detected
      showNotification(
        '🚨 SENSITIVE DATA DETECTED!',
        `Found: ${scanResult.patternName}\n${scanResult.description}\n\nDo NOT share this text with AI chat interfaces!`,
        'danger'
      );

      console.warn('🚨 Context menu scan detected sensitive data:', scanResult);
    } else {
      // SAFE: No sensitive data detected
      showNotification(
        '✅ Text is Safe',
        'No sensitive data patterns detected. This text appears safe to share.',
        'safe'
      );

      console.log('✅ Context menu scan: Text is clean');
    }
  }
});

/**
 * showNotification - Display system notification
 */
function showNotification(title, message, type = 'safe') {
  const iconPath = type === 'danger' ? 'icons/icon128.png' : 'icons/icon128.png';

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconPath,
    title: title,
    message: message,
    priority: type === 'danger' ? 2 : 1,
    requireInteraction: type === 'danger' // Danger notifications stay until dismissed
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Error creating notification:', chrome.runtime.lastError);
    } else {
      console.log('📢 Notification displayed:', notificationId);
    }
  });
}

/**
 * MESSAGE LISTENER - Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received in background:', request);
  
  if (request.type === 'SENSITIVE_DATA_DETECTED') {
    console.warn('🚨 Sensitive data blocked on:', sender.tab?.url);
    console.warn('   Pattern:', request.patternName);
    console.warn('   Matches:', request.matchCount);
    
    // Future: Log to analytics, send to monitoring service, or store in storage
    // chrome.storage.local.set({ lastBlock: request });
  }
  
  sendResponse({ success: true });
  return true; // Keep the message channel open for async responses
});
