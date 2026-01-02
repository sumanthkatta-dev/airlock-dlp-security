// Airlock: AI Security Sentry - Sensitive Data Patterns
// Author: Sumanth Katta
// This module contains regex patterns to detect sensitive information in clipboard data

/**
 * SENSITIVE_PATTERNS - A collection of regex patterns to identify sensitive data
 * Each pattern includes:
 * - regex: The regular expression to match
 * - name: Human-readable name for user alerts
 * - description: What this pattern detects
 */
const SENSITIVE_PATTERNS = {
  // IPv4 Address Pattern
  // Matches: 192.168.1.1, 10.0.0.1, 172.16.0.1
  // Avoids: Version numbers like 1.0.2 or 2.0 (by requiring all 4 octets and validating range)
  ipv4: {
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    name: 'IPv4 Address',
    description: 'Internal IP address detected'
  },

  // AWS Access Key Pattern
  // Matches: AKIA followed by exactly 16 alphanumeric characters
  // Example: AKIA1234567890ABCDEF
  awsAccessKey: {
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    name: 'AWS Access Key',
    description: 'AWS Access Key ID detected'
  },

  // AWS Secret Key Pattern (Additional security)
  // Matches: 40-character base64-like strings (AWS secret keys)
  awsSecretKey: {
    regex: /\b([A-Za-z0-9/+=]{40})\b/g,
    name: 'AWS Secret Key',
    description: 'Possible AWS Secret Access Key detected'
  },

  // Private Key Pattern
  // Matches: RSA, EC, or generic private key headers
  privateKey: {
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    name: 'Private Key',
    description: 'Private cryptographic key detected'
  },

  // Email Address Pattern
  // Matches: standard email format (user@domain.tld)
  // Corporate emails are especially sensitive
  email: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    name: 'Email Address',
    description: 'Email address detected (may contain PII)'
  },

  // Generic Secret Assignment Pattern
  // Matches: password=, api_key:, secret:, token=, etc.
  // Looks for sensitive keywords followed by assignment operators
  secretAssignment: {
    regex: /\b(password|passwd|pwd|secret|api[_-]?key|auth[_-]?token|access[_-]?token|private[_-]?key)\s*[:=]\s*["']?([^\s"']+)["']?/gi,
    name: 'Secret Assignment',
    description: 'Credential or secret assignment detected'
  },

  // API Key Pattern (Generic)
  // Matches: Common API key formats (32+ alphanumeric characters)
  genericApiKey: {
    regex: /\b[A-Za-z0-9_-]{32,}\b/g,
    name: 'API Key',
    description: 'Possible API key or token detected'
  },

  // JWT Token Pattern
  // Matches: JSON Web Tokens (three base64 segments separated by dots)
  jwtToken: {
    regex: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\b/g,
    name: 'JWT Token',
    description: 'JSON Web Token detected'
  },

  // Database Connection String Pattern
  // Matches: mongodb://, postgresql://, mysql://, etc.
  databaseUrl: {
    regex: /\b(mongodb|postgresql|mysql|postgres|redis):\/\/[^\s]+/gi,
    name: 'Database Connection String',
    description: 'Database connection URL detected'
  },

  // Social Security Number (US) Pattern
  // Matches: XXX-XX-XXXX format
  ssn: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    name: 'Social Security Number',
    description: 'US Social Security Number detected (PII)'
  },

  // Credit Card Pattern
  // Matches: 13-19 digit credit card numbers (with optional spaces or dashes)
  creditCard: {
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    name: 'Credit Card Number',
    description: 'Credit card number detected (PII)'
  }
};

/**
 * scanText - Scans text against all patterns
 * @param {string} text - The text to scan
 * @returns {Object|null} - Returns match info if found, null if clean
 */
function scanText(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Iterate through all patterns
  for (const [key, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    // Reset regex lastIndex to ensure consistent matching
    pattern.regex.lastIndex = 0;
    
    const matches = text.match(pattern.regex);
    
    if (matches && matches.length > 0) {
      return {
        patternKey: key,
        patternName: pattern.name,
        description: pattern.description,
        matchCount: matches.length,
        // Don't include actual matches for security - just report detection
        detected: true
      };
    }
  }

  return null; // No sensitive data detected
}

/**
 * getPatternNames - Returns a list of all pattern names being monitored
 * @returns {Array<string>} - Array of pattern names
 */
function getPatternNames() {
  return Object.values(SENSITIVE_PATTERNS).map(p => p.name);
}

// Export for use in content script
// This works with both module systems and direct script inclusion
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SENSITIVE_PATTERNS, scanText, getPatternNames };
}
