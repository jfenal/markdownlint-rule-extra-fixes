/**
 * MD033-fix: No inline HTML (fixable). Converts common tags to markdown, wraps rest in backticks.
 * Use with MD033 disabled to avoid duplicate violations.
 */
const OPENING_FENCE = /^```\s*$|^```\S/;
const HTML_TAG_RE = /<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/?>/g;
const DEFAULT_CONVERT = ["strong", "b", "em", "i", "br", "a"];

export default {
  names: ["MD033-fix"],
  description: "No inline HTML (fixable; converts or wraps in backticks)",
  tags: ["html"],
  parser: "none",
  function: function MD033Fix(params, onError) {
    const lines = params.lines;
    const rawConvert = params.config?.convert_elements ?? DEFAULT_CONVERT;
    const convert = Array.isArray(rawConvert) ? rawConvert : [rawConvert];
    const quoteRemaining = params.config?.quote_remaining_as_code !== false;
    let inCodeBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (OPENING_FENCE.test(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      let fixed = line;
      if (convert.includes("a")) {
        fixed = fixed.replace(
          /<a\s+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
          (_, url, text) => `[${text.trim()}](${url})`
        );
      }
      if (convert.includes("strong")) fixed = fixed.replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**");
      if (convert.includes("b")) fixed = fixed.replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**");
      if (convert.includes("em")) fixed = fixed.replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*");
      if (convert.includes("i")) fixed = fixed.replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*");
      if (convert.includes("br")) fixed = fixed.replace(/<br\s*\/?>\s*/gi, "  \n");
      if (quoteRemaining) {
        const parts = fixed.split("`");
        for (let j = 0; j < parts.length; j += 2) {
          parts[j] = parts[j].replace(HTML_TAG_RE, (tag) => "`" + tag + "`");
        }
        fixed = parts.join("`");
      }
      if (fixed !== line) {
        const lineNumber = i + 1;
        onError({
          lineNumber,
          detail: "Inline HTML",
          context: line,
          fixInfo: {
            lineNumber,
            editColumn: 1,
            deleteCount: line.length,
            insertText: fixed,
          },
        });
      }
    }
  },
};
