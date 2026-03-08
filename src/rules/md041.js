/**
 * MD041-fix: First line in file should be a top-level heading (fixable).
 * Inserts a default heading before the first content line when missing.
 * Use with MD041 disabled to avoid duplicate violations.
 */
export default {
  names: ["MD041-fix"],
  description: "First line in file should be a top-level heading (fixable)",
  tags: ["headings"],
  parser: "none",
  function: function MD041Fix(params, onError) {
    const lines = params.lines;
    const defaultHeading = params.config?.default_heading ?? "Document";
    let i = 0;
    if (lines[i]?.trim() === "---") {
      i++;
      while (i < lines.length && lines[i]?.trim() !== "---") i++;
      i++;
    }
    while (i < lines.length && /^\s*$/.test(lines[i])) i++;
    if (i >= lines.length) return;
    if (/^#\s+/.test(lines[i])) return;
    const lineNumber = i + 1;
    onError({
      lineNumber,
      detail: "First line should be a top-level heading",
      context: lines[i],
      fixInfo: {
        lineNumber,
        editColumn: 1,
        deleteCount: 0,
        insertText: "# " + defaultHeading + "\n\n",
      },
    });
  },
};
