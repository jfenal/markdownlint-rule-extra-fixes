/**
 * MD022-fix: Headings should be surrounded by blank lines (fixable).
 * Inserts a blank line before and/or after headings when missing.
 * Use with MD022 disabled to avoid duplicate violations.
 */
const OPENING_FENCE = /^```\s*$|^```\S/;
const ATX_HEADING = /^#+\s+.+/;

export default {
  names: ["MD022-fix"],
  description: "Headings should be surrounded by blank lines (fixable)",
  tags: ["headings", "blank_lines"],
  parser: "none",
  function: function MD022Fix(params, onError) {
    const lines = params.lines;
    const linesAbove = Math.max(0, Number(params.config?.lines_above ?? 1));
    const linesBelow = Math.max(0, Number(params.config?.lines_below ?? 1));
    if (linesAbove === 0 && linesBelow === 0) return;

    let inCodeBlock = false;
    const fixes = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (OPENING_FENCE.test(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      if (!ATX_HEADING.test(line)) continue;

      const lineNumber = i + 1;
      if (linesAbove > 0 && i > 0) {
        const prev = lines[i - 1];
        if (!/^\s*$/.test(prev)) {
          fixes.push({
            lineNumber,
            editColumn: 1,
            deleteCount: 0,
            insertText: "\n".repeat(linesAbove),
          });
        }
      }
      if (linesBelow > 0 && i < lines.length - 1) {
        const next = lines[i + 1];
        if (!/^\s*$/.test(next)) {
          fixes.push({
            lineNumber,
            editColumn: line.length + 1,
            deleteCount: 0,
            insertText: "\n".repeat(linesBelow),
          });
        }
      }
    }

    // Apply from bottom to top so line numbers remain valid
    fixes.reverse().forEach((fix) => {
      onError({
        lineNumber: fix.lineNumber,
        detail: "Heading should be surrounded by blank lines",
        context: lines[fix.lineNumber - 1],
        fixInfo: fix,
      });
    });
  },
};
