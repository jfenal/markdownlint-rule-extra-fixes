/**
 * MD031-fix: Fenced code blocks should be surrounded by blank lines (fixable).
 * Inserts a blank line before and/or after fenced code blocks when missing.
 * Use with MD031 disabled to avoid duplicate violations.
 */
const FENCE = /^```/;

function isListLine(line) {
  return /^\s*([-*+]|\d+\.)\s/.test(line) || /^\s*>\s*([-*+]|\d+\.)\s/.test(line);
}

export default {
  names: ["MD031-fix"],
  description: "Fenced code blocks should be surrounded by blank lines (fixable)",
  tags: ["code", "blank_lines"],
  parser: "none",
  function: function MD031Fix(params, onError) {
    const lines = params.lines;
    const listItems = params.config?.list_items !== false;
    const fixes = [];

    let i = 0;
    while (i < lines.length) {
      if (!FENCE.test(lines[i])) {
        i++;
        continue;
      }
      const blockStart = i;
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) i++;
      if (i >= lines.length) break;
      const blockEnd = i;
      i++;

      const lineNumberStart = blockStart + 1;
      const lineNumberEnd = blockEnd + 1;

      if (blockStart > 0) {
        const prev = lines[blockStart - 1];
        if (!/^\s*$/.test(prev)) {
          if (listItems || !isListLine(prev)) {
            fixes.push({
              lineNumber: lineNumberStart,
              editColumn: 1,
              deleteCount: 0,
              insertText: "\n",
            });
          }
        }
      }
      if (blockEnd < lines.length - 1) {
        const next = lines[blockEnd + 1];
        if (!/^\s*$/.test(next)) {
          fixes.push({
            lineNumber: lineNumberEnd,
            editColumn: lines[blockEnd].length + 1,
            deleteCount: 0,
            insertText: "\n",
          });
        }
      }
    }

    fixes.reverse().forEach((fix) => {
      onError({
        lineNumber: fix.lineNumber,
        detail: "Fenced code block should be surrounded by blank lines",
        context: lines[fix.lineNumber - 1],
        fixInfo: fix,
      });
    });
  },
};
