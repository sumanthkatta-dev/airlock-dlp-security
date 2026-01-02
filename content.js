// Airlock: AI Security Sentry - Content Script
// Author: Sumanth Katta
// This script runs on AI chat interfaces and monitors paste events

console.log('🔒 Airlock Sentry Active on:', window.location.hostname);

// Verify the content script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Airlock: DOM fully loaded and ready');
  });
} else {
  console.log('Airlock: DOM already loaded');
}

/**
 * PASTE EVENT LISTENER - The Core Security Logic
 * Intercepts all paste events and scans for sensitive data
 */
document.addEventListener('paste', (event) => {
  console.log('📋 Airlock: Paste event detected, scanning clipboard...');

  try {
    // Extract text from clipboard
    // Support both modern and legacy clipboard APIs
    let pastedText = '';
    
    if (event.clipboardData) {
      // Modern API (Chrome, Firefox, Edge)
      pastedText = event.clipboardData.getData('text');
    } else if (window.clipboardData) {
      // Legacy API (older IE)
      pastedText = window.clipboardData.getData('Text');
    }

    // If we couldn't get any text, allow the paste
    if (!pastedText || pastedText.trim().length === 0) {
      console.log('✅ Airlock: Empty clipboard, allowing paste');
      return;
    }

    console.log(`🔍 Airlock: Scanning ${pastedText.length} characters...`);

    // Scan the text using patterns.js
    const scanResult = scanText(pastedText);

    // If sensitive data is detected, BLOCK IT
    if (scanResult && scanResult.detected) {
      // CRITICAL: Stop the paste event immediately
      event.preventDefault();
      event.stopPropagation();

      // Alert the user with detailed information
      const alertMessage = `🚫 AIRLOCK SECURITY ALERT\n\n` +
        `Blocked: ${scanResult.patternName}\n` +
        `Reason: ${scanResult.description}\n\n` +
        `This content contains sensitive data and cannot be pasted into AI chat interfaces.\n\n` +
        `Detected ${scanResult.matchCount} match(es).`;

      alert(alertMessage);

      // Log to console for debugging
      const blockDetails = {
        patternKey: scanResult.patternKey,
        patternName: scanResult.patternName,
        description: scanResult.description,
        matchCount: scanResult.matchCount,
        textLength: pastedText.length,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      
      console.warn('🚨 MUTE BLOCKED PASTE:');
      console.warn(JSON.stringify(blockDetails, null, 2));

      // Notify background script (for future analytics/logging)
      chrome.runtime.sendMessage({
        type: 'SENSITIVE_DATA_DETECTED',
        patternName: scanResult.patternName,
        matchCount: scanResult.matchCount,
        url: window.location.href,
        timestamp: Date.now()
      }).catch(err => {
        // Silent fail if background script is not responding
        console.error('Failed to notify background script:', err);
      });

      // STOP - Do not allow the paste
      return false;
    }

    // No sensitive data detected - allow the paste
    console.log('✅ Airlock: No sensitive data detected, paste allowed');

  } catch (error) {
    // If there's any error in our scanning logic, fail open (allow paste)
    // We don't want to break the user experience if our code has a bug
    console.error('❌ Airlock: Error during paste scan:', error);
    console.warn('⚠️ Airlock: Allowing paste due to error (fail-open behavior)');
  }
}, true); // Use capture phase to intercept before other listeners

// Basic health check - confirms extension is running
const initAirlock = () => {
  console.log('✅ Airlock initialization complete');
  console.log('📍 Monitoring for paste events on:', window.location.href);
  console.log('🔐 Patterns loaded:', getPatternNames().length, 'security patterns active');
};

// Initialize immediately
initAirlock();

// Re-initialize on SPA navigation (for sites like ChatGPT)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('🔄 Airlock: SPA navigation detected, re-initializing');
    initAirlock();
  }
}).observe(document, { subtree: true, childList: true });
