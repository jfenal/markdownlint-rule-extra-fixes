/**
 * MD042-fix: No empty links. Replaces empty URL/fragment with url_placeholder.
 * Use with MD042 disabled to avoid duplicate violations.
 */
const EMPTY_LINK_RE = /\[([^\]]*)\]\(\s*#?\s*\)/g;
const DEFAULT_EMPTY_LINK_URL = "fixme_url";

export default {
  names: ["MD042-fix"],
  description: "No empty links (fixable; replaces empty URL with placeholder)",
  tags: ["links"],
  parser: "none",
  function: function MD042Fix(params, onError) {
    if (params.config === false) return;
    const lines = params.lines;
    const urlReplacement = params.config?.url_placeholder ?? DEFAULT_EMPTY_LINK_URL;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      let match;
      EMPTY_LINK_RE.lastIndex = 0;
      const fixes = [];
      while ((match = EMPTY_LINK_RE.exec(line)) !== null) {
        const openParenIndex = match[0].indexOf("(");
        const closeParenIndex = match[0].indexOf(")");
        const innerLength = closeParenIndex - openParenIndex - 1;
        const editColumn = match.index + openParenIndex + 2;
        fixes.push({
          editColumn,
          deleteCount: innerLength,
          insertText: urlReplacement,
        });
      }
      fixes.reverse().forEach((fix) => {
        onError({
          lineNumber,
          detail: "Empty link",
          context: line,
          fixInfo: { lineNumber, ...fix },
        });
      });
    }
  },
};
