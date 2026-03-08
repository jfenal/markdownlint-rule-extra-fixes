/**
 * MD033-fix: No inline HTML (fixable). Converts common tags to markdown, wraps rest in backticks.
 * Use with MD033 disabled to avoid duplicate violations.
 * Placeholder-style angle brackets in invocation examples (e.g. <path>, <value>) can be excluded
 * via allow_placeholder_tags so they are not treated as HTML.
 */
const OPENING_FENCE = /^```\s*$|^```\S/;
const HTML_TAG_RE = /<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/?>/g;
const DEFAULT_CONVERT = ["strong", "b", "em", "i", "br", "a"];
const DEFAULT_PLACEHOLDER_TAGS = [
  "branch", "config", "file", "filename", "key", "name", "option", "path",
  "placeholder", "repo", "target", "url", "value",
];

// Only treat as placeholder if tag has no attributes (e.g. <path>, not <path to="x">).
function isPlaceholderTag(tag, allowSet) {
  const m = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*>$/);
  return m && allowSet.has(m[1].toLowerCase());
}

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
    const rawPlaceholder = params.config?.allow_placeholder_tags ?? DEFAULT_PLACEHOLDER_TAGS;
    const placeholderSet =
      rawPlaceholder === false || (Array.isArray(rawPlaceholder) && rawPlaceholder.length === 0)
        ? new Set()
        : new Set(
            (Array.isArray(rawPlaceholder) ? rawPlaceholder : [rawPlaceholder]).map((s) =>
              String(s).toLowerCase()
            )
          );
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
          parts[j] = parts[j].replace(HTML_TAG_RE, (tag) => {
            if (placeholderSet.size > 0 && isPlaceholderTag(tag, placeholderSet)) return tag;
            return "`" + tag + "`";
          });
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
