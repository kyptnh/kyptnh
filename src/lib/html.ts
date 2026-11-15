/** Reduce an HTML page to readable text, keeping link targets as absolute URLs. */
export function htmlToText(html: string, base: string, limit = 14000): string {
  const abs = (href: string) => { try { return new URL(href, base).toString(); } catch { return ""; } };
  return html
    .replace(/<(script|style|noscript|svg|head|nav|footer)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const url = abs(href);
      return /^https?:/.test(url) ? `${text} [${url}] ` : `${text} `;
    })
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim()
    .slice(0, limit);
}

/** Only public https hosts may be fetched by the discovery scan. */
export function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    const h = u.hostname.toLowerCase();
    return u.protocol === "https:" && !u.username && h.includes(".") && !/^[\d.]+$/.test(h) && !h.includes(":") && !/(^|\.)(localhost|local|internal)$/.test(h);
  } catch { return false; }
}
