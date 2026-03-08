/**
 * MD047-fix: Files should end with a single newline character (fixable).
 * Use with MD047 disabled to avoid duplicate violations.
 */
export default {
  names: ["MD047-fix"],
  description: "Files should end with a single newline character (fixable)",
  tags: ["blank_lines"],
  parser: "none",
  function: function MD047Fix(params, onError) {
    const lines = params.lines;
    if (lines.length === 0) return;
    const lastLineNumber = lines.length;
    const lastLine = lines[lastLineNumber - 1];
    if (/^\s*$/.test(lastLine)) return;
    onError({
      lineNumber: lastLineNumber,
      detail: "File should end with a single newline",
      context: lastLine,
      fixInfo: {
        lineNumber: lastLineNumber,
        editColumn: lastLine.length + 1,
        deleteCount: 0,
        insertText: "\n",
      },
    });
  },
};
