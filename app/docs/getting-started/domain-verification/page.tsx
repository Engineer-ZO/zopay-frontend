"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function DomainVerificationPage() {
    return (
        <div>
            <h1>Domain Verification Guide</h1>
            
            <p>
                This guide explains how to verify your domain with ZitoPay for production API access. Domain verification is required to ensure that API requests are coming from authorized domains.
            </p>

            <h2>Understanding Domain Verification</h2>

            <h3>Why Domain Verification?</h3>
            <p>
                Domain verification ensures that:
            </p>
            <ul>
                <li>Only authorized domains can make API requests to ZitoPay</li>
                <li>Prevents unauthorized third parties from using your API keys</li>
                <li>Provides an additional layer of security for production environments</li>
            </ul>

            <h3>How It Works</h3>
            <ol>
                <li><strong>Add your domain</strong> in the ZitoPay dashboard</li>
                <li><strong>Get a verification token</strong> (unique string)</li>
                <li><strong>Add a DNS TXT record</strong> to your domain&apos;s DNS settings</li>
                <li><strong>Test the DNS record</strong> using online tools (recommended)</li>
                <li><strong>Click &quot;Verify Domain&quot;</strong> - ZitoPay checks if the TXT record exists</li>
                <li><strong>Domain is verified</strong> - You can now use the domain in API requests</li>
            </ol>

            <h2>Do I Need to Wait 15-30 Minutes?</h2>

            <h3>Short Answer</h3>
            <p>
                <strong>You can click &quot;Verify Domain&quot; immediately after adding the TXT record</strong>, but <strong>DNS propagation may take 15-30 minutes</strong> (or sometimes longer). If you click verify too soon, it will fail with a helpful error message, and you can try again later.
            </p>

            <h3>Detailed Explanation</h3>

            <h4>DNS Propagation</h4>
            <ul>
                <li>When you add a TXT record to your DNS, it doesn&apos;t appear instantly worldwide</li>
                <li>DNS servers around the world need to update their records (this is &quot;propagation&quot;)</li>
                <li>Typically takes <strong>15-30 minutes</strong>, but can take up to <strong>48 hours</strong> in rare cases</li>
                <li>Different DNS servers may see the record at different times</li>
            </ul>

            <h4>ZitoPay&apos;s Verification Process</h4>
            <ul>
                <li>When you click &quot;Verify Domain&quot;, ZitoPay immediately performs a DNS lookup</li>
                <li>It uses Google DNS (8.8.8.8) for reliability</li>
                <li>It checks for the TXT record <code>_zitopay.yourdomain.com</code></li>
                <li>If the record is found and matches your token, verification succeeds</li>
                <li>If not found, you&apos;ll get an error message and can try again later</li>
            </ul>

            <h3>Best Practice</h3>
            <ol>
                <li><strong>Add the TXT record</strong> to your DNS settings</li>
                <li><strong>Test the DNS record</strong> using online tools (see below)</li>
                <li><strong>Wait 15-30 minutes</strong> for DNS propagation</li>
                <li><strong>Click &quot;Verify Domain&quot;</strong> - it should succeed</li>
                <li><strong>If it fails</strong>, wait a bit longer and try again</li>
            </ol>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-blue-700 dark:text-blue-400 text-lg mt-0.5">💡</span>
                    <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
                        <p className="leading-relaxed">
                            <strong>Tip:</strong> You can try verifying multiple times - it won&apos;t hurt anything, and once the DNS propagates, it will succeed.
                        </p>
                    </div>
                </div>
            </div>

            <h2>Testing DNS Records Before Verification</h2>

            <p>
                <strong>Before clicking &quot;Verify Domain&quot;</strong>, you should test if your DNS record is visible using DNS lookup tools. This helps you avoid unnecessary verification attempts.
            </p>

            <h3>Using Command Line Tools</h3>

            <h4>Using dig (Linux/Mac)</h4>
            <CodeBlock
                code={`dig TXT _zitopay.yourdomain.com @8.8.8.8`}
                language="bash"
            />

            <h4>Using nslookup (Windows)</h4>
            <CodeBlock
                code={`nslookup -type=TXT _zitopay.yourdomain.com 8.8.8.8`}
                language="bash"
            />

            <h4>Expected Output</h4>
            <p>
                If the DNS record is visible, you should see output like:
            </p>
            <CodeBlock
                code={`_zitopay.yourdomain.com. 3600 IN TXT "0dea454d6af1a00004168147aa683ab6"`}
                language="text"
            />
            <p>
                If you see your verification token in the output, the DNS record is visible and you can click &quot;Verify Domain&quot;.
            </p>

            <h3>Using Online DNS Tools</h3>
            <p>
                You can also use online DNS lookup tools to check if your record is visible:
            </p>

            <ul>
                <li><strong>DNS Checker:</strong> <a href="https://dnschecker.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://dnschecker.org/</a>
                    <ul>
                        <li>Enter: <code>_zitopay.yourdomain.com</code></li>
                        <li>Select &quot;TXT&quot; record type</li>
                        <li>Shows propagation status across multiple DNS servers worldwide</li>
                    </ul>
                </li>
                <li><strong>MXToolbox:</strong> <a href="https://mxtoolbox.com/TXTLookup.aspx" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://mxtoolbox.com/TXTLookup.aspx</a>
                    <ul>
                        <li>Enter: <code>_zitopay.yourdomain.com</code></li>
                        <li>Shows TXT records for your domain</li>
                    </ul>
                </li>
                <li><strong>Google DNS:</strong> <a href="https://dns.google/query" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://dns.google/query</a>
                    <ul>
                        <li>Enter: <code>_zitopay.yourdomain.com</code></li>
                        <li>Select &quot;TXT&quot; type</li>
                    </ul>
                </li>
            </ul>

            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-green-700 dark:text-green-400 text-lg mt-0.5">✅</span>
                    <div className="flex-1 text-sm text-green-900 dark:text-green-100">
                        <p className="font-semibold mb-2">Recommended Workflow:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Add the TXT record to your DNS provider</li>
                            <li>Wait 5-10 minutes</li>
                            <li>Test using one of the tools above</li>
                            <li>If the record is visible, click &quot;Verify Domain&quot;</li>
                            <li>If not visible, wait longer and test again</li>
                        </ol>
                    </div>
                </div>
            </div>

            <h2>Domain Verification for Vercel-Hosted Sites</h2>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
                <div className="flex items-start gap-3">
                    <span className="text-red-700 dark:text-red-400 text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 text-sm text-red-900 dark:text-red-100">
                        <p className="font-semibold mb-2">Important: Vercel Preview Domains Cannot Be Verified</p>
                        <p className="leading-relaxed">
                            You <strong>CANNOT verify Vercel preview domains</strong> (like <code>your-app.vercel.app</code> or <code>eccomerce-test-drab.vercel.app</code>). Vercel doesn&apos;t allow you to add custom DNS TXT records to their preview domains. You must use a custom domain.
                        </p>
                    </div>
                </div>
            </div>

            <h3>Solution: Use a Custom Domain</h3>
            <p>
                To verify a domain for a Vercel-hosted site, you must:
            </p>
            <ol>
                <li><strong>Use your own custom domain</strong> (e.g., <code>api.yourstore.com</code>, <code>yourstore.com</code>)</li>
                <li><strong>Add the domain to Vercel</strong> (in Vercel dashboard → Settings → Domains)</li>
                <li><strong>Add the TXT record to your domain&apos;s DNS provider</strong> (not Vercel)</li>
                <li><strong>Wait for DNS propagation</strong></li>
                <li><strong>Verify in ZitoPay</strong></li>
            </ol>

            <h2>Step-by-Step: Verifying a Custom Domain on Vercel</h2>

            <h3>Step 1: Add Custom Domain to Vercel</h3>
            <ol>
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to <strong>Settings</strong> → <strong>Domains</strong></li>
                <li>Click <strong>Add Domain</strong></li>
                <li>Enter your custom domain (e.g., <code>api.yourstore.com</code>)</li>
                <li>Follow Vercel&apos;s instructions to configure DNS</li>
            </ol>
            <p>
                <strong>Note:</strong> Vercel will provide DNS records to add (usually an A record or CNAME record pointing to Vercel). Add these to your domain&apos;s DNS provider (e.g., Namecheap, GoDaddy, Cloudflare), not in Vercel.
            </p>

            <h3>Step 2: Get Verification Token from ZitoPay</h3>
            <ol>
                <li>Log in to ZitoPay dashboard</li>
                <li>Go to <strong>Settings</strong> → <strong>Domains</strong></li>
                <li>Click <strong>Add Domain</strong></li>
                <li>Enter your custom domain (e.g., <code>api.yourstore.com</code>)</li>
                <li>Copy the <strong>verification token</strong> shown</li>
            </ol>
            <p>
                <strong>Example:</strong>
            </p>
            <CodeBlock
                code={`Verification Token: 0dea454d6af1a00004168147aa683ab6`}
                language="text"
            />

            <h3>Step 3: Add TXT Record to Your Domain&apos;s DNS</h3>
            <p>
                <strong>Important:</strong> Add the TXT record to <strong>your domain&apos;s DNS provider</strong> (the same place where you manage your domain&apos;s DNS), <strong>NOT in Vercel</strong>.
            </p>

            <h4>TXT Record Details</h4>
            <div className="bg-muted/50 border border-border rounded-lg p-4 my-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 font-medium">Field</th>
                            <th className="text-left py-2 font-medium">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-2 pr-4"><strong>Type</strong></td>
                            <td className="py-2"><code>TXT</code></td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4"><strong>Name/Host</strong></td>
                            <td className="py-2"><code>_zitopay</code></td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4"><strong>Value</strong></td>
                            <td className="py-2"><code>0dea454d6af1a00004168147aa683ab6</code> (your verification token)</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4"><strong>TTL</strong></td>
                            <td className="py-2"><code>3600</code> (or default)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p>
                <strong>Full DNS Record Name:</strong> The complete DNS record will be: <code>_zitopay.api.yourstore.com</code>
            </p>

            <h3>Step 4: Wait for DNS Propagation</h3>
            <ul>
                <li><strong>Wait 15-30 minutes</strong> for DNS propagation</li>
                <li>You can check if the record is visible using online DNS lookup tools:
                    <ul>
                        <li><a href="https://dnschecker.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://dnschecker.org/</a> - Enter: <code>_zitopay.api.yourstore.com</code></li>
                        <li><a href="https://mxtoolbox.com/TXTLookup.aspx" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://mxtoolbox.com/TXTLookup.aspx</a> - Enter: <code>_zitopay.api.yourstore.com</code></li>
                    </ul>
                </li>
            </ul>

            <h3>Step 5: Test DNS Record (Recommended)</h3>
            <p>
                Before clicking &quot;Verify Domain&quot;, test if your DNS record is visible:
            </p>
            <CodeBlock
                code={`# Using dig (Linux/Mac)
dig TXT _zitopay.api.yourstore.com @8.8.8.8

# Using nslookup (Windows)
nslookup -type=TXT _zitopay.api.yourstore.com 8.8.8.8`}
                language="bash"
            />
            <p>
                If you see your verification token in the output, the DNS record is visible and you can proceed to verification.
            </p>

            <h3>Step 6: Verify Domain in ZitoPay</h3>
            <ol>
                <li>Go back to ZitoPay dashboard</li>
                <li>Find your domain in the list</li>
                <li>Click <strong>&quot;Verify Domain&quot;</strong> button</li>
                <li>If successful, the domain will show as <strong>&quot;Verified&quot;</strong></li>
                <li>If it fails, wait a bit longer and try again</li>
            </ol>

            <h2>Common DNS Providers: Where to Add TXT Records</h2>

            <h3>Namecheap</h3>
            <ol>
                <li>Log in to Namecheap</li>
                <li>Go to <strong>Domain List</strong></li>
                <li>Click <strong>Manage</strong> next to your domain</li>
                <li>Go to <strong>Advanced DNS</strong> tab</li>
                <li>Click <strong>Add New Record</strong></li>
                <li>Select <strong>TXT Record</strong></li>
                <li>Enter:
                    <ul>
                        <li><strong>Host:</strong> <code>_zitopay</code></li>
                        <li><strong>Value:</strong> <code>your-verification-token</code></li>
                        <li><strong>TTL:</strong> Automatic (or 3600)</li>
                    </ul>
                </li>
                <li>Click <strong>Save</strong></li>
            </ol>

            <h3>GoDaddy</h3>
            <ol>
                <li>Log in to GoDaddy</li>
                <li>Go to <strong>My Products</strong></li>
                <li>Click <strong>DNS</strong> next to your domain</li>
                <li>Scroll to <strong>Records</strong> section</li>
                <li>Click <strong>Add</strong> → <strong>TXT</strong></li>
                <li>Enter:
                    <ul>
                        <li><strong>Name:</strong> <code>_zitopay</code></li>
                        <li><strong>Value:</strong> <code>your-verification-token</code></li>
                        <li><strong>TTL:</strong> 1 Hour (or 3600)</li>
                    </ul>
                </li>
                <li>Click <strong>Save</strong></li>
            </ol>

            <h3>Cloudflare</h3>
            <ol>
                <li>Log in to Cloudflare</li>
                <li>Select your domain</li>
                <li>Go to <strong>DNS</strong> → <strong>Records</strong></li>
                <li>Click <strong>Add record</strong></li>
                <li>Enter:
                    <ul>
                        <li><strong>Type:</strong> TXT</li>
                        <li><strong>Name:</strong> <code>_zitopay</code></li>
                        <li><strong>Content:</strong> <code>your-verification-token</code></li>
                        <li><strong>TTL:</strong> Auto (or 3600)</li>
                    </ul>
                </li>
                <li>Click <strong>Save</strong></li>
            </ol>

            <h3>Google Domains</h3>
            <ol>
                <li>Log in to Google Domains</li>
                <li>Select your domain</li>
                <li>Go to <strong>DNS</strong> tab</li>
                <li>Scroll to <strong>Custom resource records</strong></li>
                <li>Click <strong>Add custom record</strong></li>
                <li>Enter:
                    <ul>
                        <li><strong>Name:</strong> <code>_zitopay</code></li>
                        <li><strong>Type:</strong> TXT</li>
                        <li><strong>Data:</strong> <code>your-verification-token</code></li>
                        <li><strong>TTL:</strong> 3600</li>
                    </ul>
                </li>
                <li>Click <strong>Add</strong></li>
            </ol>

            <h3>AWS Route 53</h3>
            <ol>
                <li>Log in to AWS Console</li>
                <li>Go to <strong>Route 53</strong> → <strong>Hosted zones</strong></li>
                <li>Select your domain</li>
                <li>Click <strong>Create record</strong></li>
                <li>Enter:
                    <ul>
                        <li><strong>Record name:</strong> <code>_zitopay</code></li>
                        <li><strong>Record type:</strong> TXT</li>
                        <li><strong>Value:</strong> <code>your-verification-token</code></li>
                        <li><strong>TTL:</strong> 3600</li>
                    </ul>
                </li>
                <li>Click <strong>Create records</strong></li>
            </ol>

            <h2>Troubleshooting</h2>

            <h3>&quot;DNS TXT record not found&quot; Error</h3>
            <p>
                <strong>Possible Causes:</strong>
            </p>
            <ul>
                <li><strong>DNS hasn&apos;t propagated yet</strong> - Wait 15-30 minutes and try again</li>
                <li><strong>TXT record not added correctly</strong> - Double-check the record in your DNS provider</li>
                <li><strong>Wrong record name</strong> - Must be exactly <code>_zitopay</code> (not <code>zitopay</code> or <code>_zitopay.</code>)</li>
                <li><strong>Wrong domain</strong> - Ensure you&apos;re adding the record for the exact domain you registered</li>
            </ul>

            <p>
                <strong>Solutions:</strong>
            </p>
            <ol>
                <li><strong>Check DNS propagation:</strong>
                    <CodeBlock
                        code={`# Using dig (Linux/Mac)
dig TXT _zitopay.yourdomain.com

# Using nslookup (Windows)
nslookup -type=TXT _zitopay.yourdomain.com`}
                        language="bash"
                    />
                </li>
                <li><strong>Verify record in DNS provider:</strong>
                    <ul>
                        <li>Log in to your DNS provider</li>
                        <li>Check that the TXT record exists</li>
                        <li>Verify the name is exactly <code>_zitopay</code></li>
                        <li>Verify the value matches your verification token exactly</li>
                    </ul>
                </li>
                <li><strong>Wait longer:</strong>
                    <ul>
                        <li>DNS propagation can take up to 48 hours in rare cases</li>
                        <li>Try again after waiting</li>
                    </ul>
                </li>
            </ol>

            <h3>&quot;DNS lookup timeout&quot; Error</h3>
            <p>
                <strong>Possible Causes:</strong>
            </p>
            <ul>
                <li><strong>DNS server issues</strong> - Temporary DNS server problems</li>
                <li><strong>Network connectivity issues</strong></li>
            </ul>

            <p>
                <strong>Solutions:</strong>
            </p>
            <ul>
                <li><strong>Try again</strong> - Usually resolves itself</li>
                <li><strong>Check your domain&apos;s DNS settings</strong> - Ensure DNS is configured correctly</li>
                <li><strong>Contact support</strong> if the issue persists</li>
            </ul>

            <h3>Vercel Domain Verification Issues</h3>
            <p>
                <strong>Problem:</strong> Can&apos;t verify <code>*.vercel.app</code> domain
            </p>
            <p>
                <strong>Solution:</strong>
            </p>
            <ul>
                <li>You <strong>cannot</strong> verify Vercel preview domains</li>
                <li>You <strong>must</strong> use a custom domain</li>
                <li>Add your custom domain to Vercel first</li>
                <li>Then add the TXT record to your domain&apos;s DNS provider (not Vercel)</li>
            </ul>

            <h2>Quick Reference</h2>

            <h3>TXT Record Format</h3>
            <CodeBlock
                code={`Type: TXT
Name: _zitopay
Value: [your-verification-token]
TTL: 3600 (or default)`}
                language="text"
            />

            <h3>Full DNS Record Name</h3>
            <CodeBlock
                code={`_zitopay.yourdomain.com`}
                language="text"
            />

            <h3>Verification Steps</h3>
            <ol>
                <li>✅ Add domain in ZitoPay dashboard</li>
                <li>✅ Copy verification token</li>
                <li>✅ Add TXT record to your DNS provider</li>
                <li>✅ <strong>Test DNS record using online tools</strong> (recommended)</li>
                <li>✅ Wait 15-30 minutes for propagation</li>
                <li>✅ Click &quot;Verify Domain&quot; in ZitoPay</li>
                <li>✅ Domain is verified!</li>
            </ol>

            <h2>FAQ</h2>

            <h3>Q: Can I verify a Vercel preview domain (e.g., `app.vercel.app`)?</h3>
            <p>
                <strong>A:</strong> No. Vercel preview domains cannot be verified because you don&apos;t have DNS control. You must use a custom domain.
            </p>

            <h3>Q: How long do I need to wait after adding the TXT record?</h3>
            <p>
                <strong>A:</strong> Typically 15-30 minutes, but can take up to 48 hours. You can try verifying immediately, but it may fail until DNS propagates. <strong>We recommend testing the DNS record first using online tools before clicking verify.</strong>
            </p>

            <h3>Q: Can I click &quot;Verify Domain&quot; multiple times?</h3>
            <p>
                <strong>A:</strong> Yes! It&apos;s safe to retry. Once DNS propagates, verification will succeed.
            </p>

            <h3>Q: Where do I add the TXT record for a Vercel site?</h3>
            <p>
                <strong>A:</strong> Add it to your <strong>domain&apos;s DNS provider</strong> (where you registered the domain), NOT in Vercel. Vercel only handles A/CNAME records for routing.
            </p>

            <h3>Q: What if verification keeps failing?</h3>
            <p>
                <strong>A:</strong>
            </p>
            <ol>
                <li>Check that the TXT record exists in your DNS provider</li>
                <li>Verify the record name is exactly <code>_zitopay</code></li>
                <li>Verify the value matches your token exactly</li>
                <li><strong>Test DNS propagation using online tools</strong> (dnschecker.org, mxtoolbox.com)</li>
                <li>Wait longer (up to 48 hours)</li>
                <li>Contact ZitoPay support if still failing</li>
            </ol>

            <h3>Q: Should I test the DNS record before clicking verify?</h3>
            <p>
                <strong>A:</strong> <strong>Yes, highly recommended!</strong> Use online tools like <a href="https://dnschecker.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dnschecker.org</a> or command-line tools to verify the record is visible before clicking &quot;Verify Domain&quot;. This saves time and avoids unnecessary verification attempts.
            </p>

            <h2>Next Steps</h2>
            <ul>
                <li>Learn about <Link href="/docs/getting-started/implementation-guide" className="text-primary hover:underline">Gateway Configuration</Link></li>
                <li>View <Link href="/docs/getting-started/using-the-api" className="text-primary hover:underline">Using the API</Link> guide</li>
                <li>Check the <Link href="/docs/faq" className="text-primary hover:underline">FAQ</Link> for more answers</li>
            </ul>
        </div>
    );
}
