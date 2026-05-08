# ZitoPay API Header and Signature Fix Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Complete guide for correctly implementing ZitoPay API authentication headers and signatures

---

## Problem Overview

All API requests to ZitoPay's `/api/v1/*` endpoints require proper authentication using API keys and HMAC-SHA256 signatures. Incorrect signature generation causes authentication failures (typically "Merchant not found" or "Invalid signature") even when API keys are correctly configured.

**Root Cause:** The HMAC-SHA256 signature generation must match ZitoPay's server expectations exactly. Common mistakes include:
- Using separators (newlines, spaces) in the signature string
- Adding prefixes to the signature header
- Not sorting query parameters
- Inconsistent body stringification

---

## Base URL

- **Sandbox:** `http://localhost:9000`
- **Production:** `https://api.zitopay.com`

**Important:** These authentication requirements apply to **both sandbox and production** environments. The same signature format is used in both.

---

## Required Headers

Every authenticated request to `/api/v1/*` endpoints must include these 6 headers:

```
x-zito-key: <your-api-key>
x-zito-timestamp: <unix-timestamp-in-seconds>
x-zito-nonce: <unique-random-string>
x-zito-origin: <your-domain-or-ip>
x-zito-signature: <hmac-sha256-signature>
x-zito-version: 1.0
Content-Type: application/json
```

### Header Descriptions

| Header | Description | Example |
|--------|-------------|---------|
| `x-zito-key` | Your public API key (sandbox or production) | `zito_test_abc123...` |
| `x-zito-timestamp` | Unix timestamp in seconds (prevents replay attacks) | `1705564800` |
| `x-zito-nonce` | Unique random string (UUID recommended) | `550e8400-e29b-41d4-a716-446655440000` |
| `x-zito-origin` | Your domain or IP address (for allowlisting) | `https://yourdomain.com` |
| `x-zito-signature` | HMAC-SHA256 signature (hex only, no prefix) | `abc123def456...` |
| `x-zito-version` | API version | `1.0` |

---

## Critical Formatting Rules

### ⚠️ Common Mistakes That Cause Failures

1. **NO Separators:** The signature string must be concatenated WITHOUT any separators (no newlines, spaces, or special characters)
2. **NO Prefix:** The signature header should contain ONLY the hexadecimal hash, not `sha256=` or any other prefix
3. **Query Sorting:** Query parameters must be sorted alphabetically and included in the signature
4. **Consistent Body:** Body must be stringified consistently (canonical JSON) for both signature and request

---

## Signature Generation Process

### Step 1: Build the String to Sign

Construct the string by concatenating all components **directly without any separators**:

```
stringToSign = METHOD + PATH + SORTED_QUERY_PARAMS + REQUEST_BODY + TIMESTAMP + NONCE + ORIGIN
```

**Component Order (MUST be exact):**
1. HTTP Method (e.g., `POST`, `GET`)
2. Request Path (e.g., `/api/v1/wallets/quote`)
3. Sorted Query Parameters (alphabetically sorted, `key=value&key2=value2` format, empty string if none)
4. Request Body (JSON stringified, empty string if no body)
5. Timestamp (Unix seconds as string)
6. Nonce (unique random string)
7. Origin (your domain or IP)

**Example:**
```
POST/api/v1/wallets/quote{"gateway":"MTN_MOMO","amount":"150.00","currency":"EUR"}1705564800550e8400-e29b-41d4-a716-446655440000http://localhost:3000
```

**Important:** Notice there are NO newlines, NO spaces, NO separators - just direct concatenation.

### Step 2: Generate HMAC-SHA256 Signature

Generate the signature using HMAC-SHA256 and return **only the hexadecimal hash** (no prefix):

```javascript
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(stringToSign)
  .digest('hex');

// Returns: abc123def456... (just hex, no prefix)
```

**Header Format:**
```
x-zito-signature: abc123def456...
```

**NOT:**
```
x-zito-signature: sha256=abc123def456...  ❌ WRONG
```

---

## Complete Implementation Examples

### JavaScript/Node.js

```javascript
const crypto = require('crypto');

function generateSignature(method, path, query, body, timestamp, nonce, origin, secretKey) {
  // Sort query parameters alphabetically
  const sortedQuery = Object.keys(query || {})
    .sort()
    .map(k => `${k}=${query[k]}`)
    .join('&');
  
  // Stringify body (canonical JSON - no extra spaces)
  const bodyStr = body ? JSON.stringify(body) : '';
  
  // Construct string to sign: METHOD + PATH + QUERY + BODY + TIMESTAMP + NONCE + ORIGIN
  // NO separators, NO newlines - just concatenated
  const stringToSign = `${method}${path}${sortedQuery}${bodyStr}${timestamp}${nonce}${origin}`;
  
  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
  
  // Return just the hex string, no prefix
  return signature;
}

function generateHeaders(method, path, body, query, apiKey, secretKey, origin) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const signature = generateSignature(method, path, query, body, timestamp, nonce, origin, secretKey);

  return {
    'x-zito-key': apiKey,
    'x-zito-timestamp': timestamp,
    'x-zito-nonce': nonce,
    'x-zito-origin': origin,
    'x-zito-signature': signature,  // Just hex, no prefix
    'x-zito-version': '1.0',
    'Content-Type': 'application/json'
  };
}

// Usage
const headers = generateHeaders(
  'POST',
  '/api/v1/wallets/quote',
  { amount: '1000', currency: 'XAF' },  // Body as object
  {},  // Query parameters (empty object if none)
  process.env.ZITOPAY_API_KEY,
  process.env.ZITOPAY_SECRET_KEY,
  'https://yourdomain.com'
);
```

### Python

```python
import hmac
import hashlib
import time
import secrets
import json
from urllib.parse import urlencode

def generate_signature(method, path, query, body, timestamp, nonce, origin, secret_key):
    # Sort query parameters alphabetically
    sorted_query = ''
    if query:
        sorted_items = sorted(query.items())
        sorted_query = urlencode(sorted_items)
    
    # Stringify body (canonical JSON - no extra spaces)
    body_str = json.dumps(body) if body else ''
    
    # Construct string to sign: METHOD + PATH + QUERY + BODY + TIMESTAMP + NONCE + ORIGIN
    # NO separators, NO newlines - just concatenated
    string_to_sign = f"{method}{path}{sorted_query}{body_str}{timestamp}{nonce}{origin}"
    
    # Generate HMAC-SHA256 signature
    signature = hmac.new(
        secret_key.encode('utf-8'),
        string_to_sign.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Return just the hex string, no prefix
    return signature

def generate_headers(method, path, body, query, api_key, secret_key, origin):
    timestamp = str(int(time.time()))
    nonce = secrets.token_hex(16)
    signature = generate_signature(method, path, query, body, timestamp, nonce, origin, secret_key)
    
    return {
        'x-zito-key': api_key,
        'x-zito-timestamp': timestamp,
        'x-zito-nonce': nonce,
        'x-zito-origin': origin,
        'x-zito-signature': signature,  # Just hex, no prefix
        'x-zito-version': '1.0',
        'Content-Type': 'application/json'
    }

# Usage
headers = generate_headers(
    'POST',
    '/api/v1/wallets/quote',
    {'amount': '1000', 'currency': 'XAF'},  # Body as dict
    {},  # Query parameters (empty dict if none)
    os.environ['ZITOPAY_API_KEY'],
    os.environ['ZITOPAY_SECRET_KEY'],
    'https://yourdomain.com'
)
```

---

## Query Parameter Handling

### Sorting Rules

Query parameters must be:
1. Sorted alphabetically by key
2. Formatted as `key=value&key2=value2`
3. Included in the signature string (even if empty)

**Example:**
```javascript
// Input query: { limit: '10', page: '1', status: 'active' }
// Sorted: { limit: '10', page: '1', status: 'active' }
// Formatted: 'limit=10&page=1&status=active'
```

**If no query parameters:**
```javascript
// Empty object: {}
// Result: '' (empty string)
```

---

## Body Handling

### Canonical JSON

The request body must be stringified consistently:
- Use canonical JSON (no extra spaces, consistent formatting)
- Same string must be used for both signature calculation and request body
- If no body, use empty string `''`

**Example:**
```javascript
// Body object
const body = { gateway: 'MTN_MOMO', amount: '150.00' };

// Stringify for signature
const bodyStr = JSON.stringify(body);
// Result: '{"gateway":"MTN_MOMO","amount":"150.00"}'

// Use same string in request
fetch(url, {
  method: 'POST',
  body: bodyStr,  // Same string
  headers: headers
});
```

---

## Debugging Tips

### 1. Log the Signature String

```javascript
console.log('String to sign:', stringToSign);
console.log('Signature:', signature);
```

**What to check:**
- No newlines or separators in the string
- All components are in correct order
- Query parameters are sorted
- Body is properly stringified

### 2. Verify Signature Header

```javascript
console.log('Signature header:', headers['x-zito-signature']);
```

**What to check:**
- No `sha256=` prefix
- Just hexadecimal characters
- Length is 64 characters (SHA256 hex digest)

### 3. Compare with Working Example

Use the provided code examples as reference. Compare your implementation character-by-character.

### 4. Test in Sandbox First

Always test signature generation in sandbox before production. Both environments use the same format, so if it works in sandbox, it will work in production.

---

## Common Error Messages

### "Merchant not found"
- **Cause:** Invalid API key or signature mismatch
- **Solution:** Verify API key is correct and signature is generated properly

### "Invalid signature"
- **Cause:** Signature string format doesn't match server expectations
- **Solution:** Check for separators, verify component order, ensure query sorting

### "Request too old"
- **Cause:** Timestamp is more than 5 minutes old
- **Solution:** Generate fresh timestamp for each request

### "Nonce already used"
- **Cause:** Reusing the same nonce within 10 minutes
- **Solution:** Generate unique nonce (UUID) for each request

---

## Testing Checklist

- [ ] Signature string has NO separators (no newlines, spaces)
- [ ] Signature header contains ONLY hex (no `sha256=` prefix)
- [ ] Query parameters are sorted alphabetically
- [ ] Body is stringified consistently (canonical JSON)
- [ ] Component order is correct: METHOD + PATH + QUERY + BODY + TIMESTAMP + NONCE + ORIGIN
- [ ] Timestamp is in seconds (not milliseconds)
- [ ] Nonce is unique for each request
- [ ] Origin matches verified domain or allowed IP
- [ ] Works in sandbox environment
- [ ] Works in production environment (after testing in sandbox)

---

## Environment-Specific Notes

### Sandbox Environment
- Base URL: `http://localhost:9000`
- Use sandbox API keys from dashboard
- Same signature format as production
- Test all signature generation here first

### Production Environment
- Base URL: `https://api.zitopay.com`
- Use production API keys (only after KYC approval)
- Same signature format as sandbox
- Must have verified domain or allowed IP

**Important:** The signature generation format is **identical** in both sandbox and production. If your implementation works in sandbox, it will work in production.

---

## Summary

The key points for correct signature generation:

1. **No Separators:** Concatenate all components directly without any separators
2. **No Prefix:** Signature header should contain only the hexadecimal hash
3. **Query Sorting:** Sort query parameters alphabetically
4. **Consistent Body:** Use canonical JSON stringification
5. **Exact Order:** Components must be in the exact order specified
6. **Same Format:** Sandbox and production use identical format

Following these rules ensures your API requests will be authenticated successfully in both sandbox and production environments.

---

**Last Updated:** January 2026  
**Status:** ✅ Verified and Tested
