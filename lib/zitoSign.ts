/**
 * ZitoPay HMAC-SHA256 request signing utility (browser-compatible).
 * Used for all /api/v1/* routes which require signed headers.
 * See docs/API_HEADER_SIGNATURE_GUIDE.md for full specification.
 */

const STORAGE_KEY_SANDBOX = 'zito_secret_sandbox';
const STORAGE_KEY_PRODUCTION = 'zito_secret_production';

// ---- Secret key persistence ----

export function storeSecretKey(secretKey: string, environment: 'sandbox' | 'production') {
    try {
        const key = environment === 'production' ? STORAGE_KEY_PRODUCTION : STORAGE_KEY_SANDBOX;
        localStorage.setItem(key, secretKey);
    } catch {
        // localStorage unavailable (SSR or private mode)
    }
}

export function getSecretKey(environment: 'sandbox' | 'production'): string | null {
    try {
        const key = environment === 'production' ? STORAGE_KEY_PRODUCTION : STORAGE_KEY_SANDBOX;
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

// ---- Signature generation ----

async function hmacSha256Hex(secretKey: string, message: string): Promise<string> {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export interface ZitoHeaders {
    'x-zito-key': string;
    'x-zito-timestamp': string;
    'x-zito-nonce': string;
    'x-zito-origin': string;
    'x-zito-signature': string;
    'x-zito-version': string;
    [key: string]: string;
}

/**
 * Generate the 6 required HMAC-signed headers for a /api/v1/* request.
 *
 * @param method   HTTP method (e.g. 'POST', 'GET')
 * @param path     Request path including leading slash (e.g. '/api/v1/disbursements/bulk/preview')
 * @param query    Query parameters as a plain object (sorted alphabetically in the signature)
 * @param body     Request body as a plain object (or null for GET/DELETE with no body)
 * @param apiKey   The public API key (x-zito-key)
 * @param secretKey The secret key used for HMAC signing
 */
export async function buildZitoHeaders(
    method: string,
    path: string,
    query: Record<string, string>,
    body: object | null,
    apiKey: string,
    secretKey: string
): Promise<ZitoHeaders> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.zitopay.com';

    // Sort query params alphabetically
    const sortedQuery = Object.keys(query)
        .sort()
        .map(k => `${k}=${query[k]}`)
        .join('&');

    const bodyStr = body !== null ? JSON.stringify(body) : '';

    // Signature string: METHOD + PATH + SORTED_QUERY + BODY + TIMESTAMP + NONCE + ORIGIN (no separators)
    const stringToSign = `${method.toUpperCase()}${path}${sortedQuery}${bodyStr}${timestamp}${nonce}${origin}`;

    const signature = await hmacSha256Hex(secretKey, stringToSign);

    return {
        'x-zito-key': apiKey,
        'x-zito-timestamp': timestamp,
        'x-zito-nonce': nonce,
        'x-zito-origin': origin,
        'x-zito-signature': signature,
        'x-zito-version': '1.0',
    };
}
