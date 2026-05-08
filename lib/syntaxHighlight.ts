// Syntax highlighting utilities
// This would typically use a library like 'prismjs' or 'highlight.js'

export function highlightCode(
  code: string,
  language: string = "typescript"
): string {
  // Placeholder for code highlighting
  return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
}

function escapeHtml(text: string): string {
  if (typeof window === "undefined") {
    // Server-side escape
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
