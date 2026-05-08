"use client";

import { CodeBlock } from "@/components/docs/CodeBlock";

export default function AuthenticationPage() {
    return (
        <div>
            <h1>Authentication</h1>
            <p>
                ZitoPay uses API key authentication with HMAC-SHA256 signature verification for secure API access. This guide explains how to authenticate your requests.
            </p>

            <h2>API Key Authentication</h2>
            <p>
                All <code>/api/v1/*</code> endpoints require authentication using your API key and a cryptographic signature. This ensures that only authorized requests are processed.
            </p>

            <h2>Required Headers</h2>
            <p>
                Every authenticated request must include the following headers:
            </p>
            <CodeBlock
                code={`x-zito-key: <your-api-key>
x-zito-timestamp: <unix-timestamp-in-seconds>
x-zito-nonce: <unique-random-string>
x-zito-origin: <your-domain-or-ip>
x-zito-signature: <hmac-sha256-signature>
x-zito-version: 1.0
Content-Type: application/json`}
                language="http"
            />

            <h3>Header Descriptions</h3>
            <table>
                <thead>
                    <tr>
                        <th>Header</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>x-zito-key</code></td>
                        <td>Your public API key from the dashboard</td>
                    </tr>
                    <tr>
                        <td><code>x-zito-timestamp</code></td>
                        <td>Unix timestamp in seconds (prevents replay attacks)</td>
                    </tr>
                    <tr>
                        <td><code>x-zito-nonce</code></td>
                        <td>Unique random string for each request (prevents replay attacks)</td>
                    </tr>
                    <tr>
                        <td><code>x-zito-origin</code></td>
                        <td>Your domain or IP address (for allowlisting)</td>
                    </tr>
                    <tr>
                        <td><code>x-zito-signature</code></td>
                        <td>HMAC-SHA256 signature of the request</td>
                    </tr>
                    <tr>
                        <td><code>x-zito-version</code></td>
                        <td>API version (currently "1.0")</td>
                    </tr>
                </tbody>
            </table>

            <h2>Generating the Signature</h2>
            <p>
                The signature is a HMAC-SHA256 hash of a string built from your request details. The format must match exactly - even small differences will cause authentication failures.
            </p>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="font-semibold mb-2">Critical: Common Mistakes That Cause Authentication Failures</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>NO separators:</strong> The signature string must be concatenated WITHOUT any separators (no newlines, spaces, or special characters)</li>
                            <li><strong>NO prefix:</strong> The signature header should contain ONLY the hexadecimal hash, not <code>sha256=</code> or any other prefix</li>
                            <li><strong>Query sorting:</strong> Query parameters must be sorted alphabetically and included in the signature</li>
                            <li><strong>Consistent body:</strong> Body must be stringified consistently (canonical JSON) for both signature and request</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h3>Step 1: Build the String to Sign</h3>
            <p>
                Construct the string by concatenating all components <strong>directly without any separators</strong>:
            </p>
            <CodeBlock
                code={`stringToSign = METHOD + PATH + SORTED_QUERY_PARAMS + REQUEST_BODY + TIMESTAMP + NONCE + ORIGIN`}
                language="text"
            />
            <p className="text-xs text-muted-foreground mt-2">
                <strong>Important:</strong> All components are concatenated directly - no newlines, no spaces, no separators. The order must be exactly as shown above.
            </p>

            <h3>Step 2: Generate HMAC-SHA256 Signature</h3>
            <p>
                Generate the signature using HMAC-SHA256 and return <strong>only the hexadecimal hash</strong> (no prefix):
            </p>
            <CodeBlock
                code={`signature = HMAC-SHA256(secretKey, stringToSign)
// Returns: abc123def456... (just hex, no prefix)`}
                language="text"
            />
            <p className="text-xs text-muted-foreground mt-2">
                <strong>Important:</strong> The signature header should contain only the hex string. Do NOT add <code>sha256=</code> or any other prefix.
            </p>

            <h2>JavaScript Example</h2>
            <CodeBlock
                code={`const crypto = require('crypto');

function generateSignature(method, path, query, body, timestamp, nonce, origin, secretKey) {
  // Sort query parameters alphabetically
  const sortedQuery = Object.keys(query || {})
    .sort()
    .map(k => \`\${k}=\${query[k]}\`)
    .join('&');
  
  // Stringify body (canonical JSON - no extra spaces)
  const bodyStr = body ? JSON.stringify(body) : '';
  
  // Construct string to sign: METHOD + PATH + QUERY + BODY + TIMESTAMP + NONCE + ORIGIN
  // NO separators, NO newlines - just concatenated
  const stringToSign = \`\${method}\${path}\${sortedQuery}\${bodyStr}\${timestamp}\${nonce}\${origin}\`;
  
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
);`}
                language="javascript"
            />

            <h2>Python Example</h2>
            <CodeBlock
                code={`import hmac
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
)`}
                language="python"
            />

            <h2>Common Issues and Solutions</h2>
            
            <h3>Issue: "Invalid signature" or "Merchant not found" errors</h3>
            <p>
                If you're getting authentication errors even with correct API keys, check these:
            </p>
            <ul>
                <li><strong>Signature string format:</strong> Ensure NO separators (no newlines, spaces, or special characters) between components</li>
                <li><strong>Signature header format:</strong> Must be just the hex string, no <code>sha256=</code> prefix</li>
                <li><strong>Query parameters:</strong> Must be sorted alphabetically and included in signature</li>
                <li><strong>Body formatting:</strong> Use canonical JSON (same string for signature and request body)</li>
                <li><strong>Component order:</strong> Must be exactly: METHOD + PATH + QUERY + BODY + TIMESTAMP + NONCE + ORIGIN</li>
            </ul>

            <h3>Debugging Tips</h3>
            <ul>
                <li>Log the exact <code>stringToSign</code> value and compare character-by-character</li>
                <li>Verify the signature is just hex (no prefix) in the header</li>
                <li>Ensure query parameters are sorted alphabetically</li>
                <li>Check that body JSON is stringified consistently</li>
                <li>Verify timestamp is in seconds (not milliseconds)</li>
                <li>Ensure nonce is unique for each request</li>
            </ul>

            <h2>Security Best Practices</h2>
            <ul>
                <li><strong>Never expose your secret key:</strong> Keep it server-side only</li>
                <li><strong>Use HTTPS:</strong> Always use HTTPS in production</li>
                <li><strong>Validate timestamps:</strong> Reject requests with timestamps too far in the past/future</li>
                <li><strong>Use unique nonces:</strong> Never reuse nonces to prevent replay attacks</li>
                <li><strong>Rotate keys regularly:</strong> Change your API keys periodically</li>
                <li><strong>IP Whitelisting:</strong> Configure IP allowlists in production</li>
                <li><strong>Test in sandbox first:</strong> Always test signature generation in sandbox before production</li>
            </ul>

            <h2>Public Endpoints</h2>
            <p>
                Some endpoints don't require authentication:
            </p>
            <ul>
                <li><code>/public/v1/*</code> - Public endpoints (no authentication)</li>
            </ul>

            <h2>IAM-Protected Routes</h2>
            <p>
                Non-API routes (dashboard, admin, etc.) use JWT token authentication:
            </p>
            <CodeBlock
                code={`Authorization: Bearer <jwt-token>`}
                language="http"
            />

            <h2>Error Responses</h2>
            <p>
                Authentication failures return <code>401 Unauthorized</code>:
            </p>
            <CodeBlock
                code={`{
  "error": "Unauthorized",
  "message": "Invalid signature",
  "code": "AUTH_ERROR"
}`}
                language="json"
            />
        </div>
    );
}
