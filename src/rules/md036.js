/**
 * MD036-fix: Emphasis used instead of a heading (fixable).
 * Converts a line that is only **Bold** or *Italic* into a proper heading.
 * Use with MD036 disabled to avoid duplicate violations.
 */
const OPENING_FENCE = /^```\s*$|^```\S/;

export default {
  names: ["MD036-fix"],
  description: "Emphasis used instead of a heading (fixable)",
  tags: ["headings", "emphasis"],
  parser: "none",
  function: function MD036Fix(params, onError) {
    if (params.config === false) return;
    const lines = params.lines;
    const level = Math.min(6, Math.max(1, Number(params.config?.heading_level ?? 2)));
    const prefix = "#".repeat(level) + " ";
    let inCodeBlock = false;
    let lastHeadingLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (OPENING_FENCE.test(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      const atx = line.match(/^(#+)\s/);
      if (atx) {
        lastHeadingLevel = atx[1].length;
        continue;
      }
      const nextLevel = lastHeadingLevel > 0 ? Math.min(lastHeadingLevel + 1, 6) : level;
      const headingPrefix = "#".repeat(nextLevel) + " ";
      const trimmed = line.trim();
      let converted = null;
      if (trimmed && !/^\s*[-*+]\s/.test(line) && !/^\s*\d+\.\s/.test(line) && !/^\s*>\s/.test(line)) {
        const boldMatch = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
        if (boldMatch) converted = headingPrefix + boldMatch[1];
        else {
          const italicMatch = trimmed.match(/^\*(.+?)\*\s*$/);
          if (italicMatch && !italicMatch[1].includes("*")) converted = headingPrefix + italicMatch[1];
          else {
            const underscoreBold = trimmed.match(/^__(.+?)__\s*$/);
            if (underscoreBold) converted = headingPrefix + underscoreBold[1];
            else {
              const underscoreItalic = trimmed.match(/^_(.+?)_\s*$/);
              if (underscoreItalic && !underscoreItalic[1].includes("_"))
                converted = headingPrefix + underscoreItalic[1];
            }
          }
        }
      }
      if (converted !== null) {
        const lineNumber = i + 1;
        onError({
          lineNumber,
          detail: "Emphasis used instead of a heading",
          context: line,
          fixInfo: {
            lineNumber,
            editColumn: 1,
            deleteCount: line.length,
            insertText: converted,
          },
        });
        lastHeadingLevel = nextLevel;
      }
    }
  },
};
