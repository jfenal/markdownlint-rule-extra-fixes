/**
 * MD013-fix: Line length (fixable). Wraps long lines; supports paragraphs, list items, blockquotes.
 * Use with MD013 disabled to avoid duplicate violations, or use to add fix where core does not.
 */
import { wrapLine, wrapWithPrefix } from "../shared/wrap-line.js";

const DEFAULT_LINE_LENGTH = 80;
const OPENING_FENCE = /^```\s*$|^```\S/;

export default {
  names: ["MD013-fix"],
  description: "Line length (fixable; wraps paragraphs, lists, blockquotes)",
  tags: ["line_length"],
  parser: "none",
  function: function MD013Fix(params, onError) {
    const lines = params.lines;
    const maxLen = Number(params.config?.line_length ?? DEFAULT_LINE_LENGTH);
    let inCodeBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (OPENING_FENCE.test(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      const skipLine =
        /^\s*#+\s/.test(line) ||
        (/^\s*\|.+\|/.test(line) || /^\s*\|?\s*[-:]+\s*\|/.test(line)) ||
        /^\s*$/.test(line);
      if (inCodeBlock || skipLine || line.length <= maxLen) continue;
      let wrapped;
      const blockquoteMatch = line.match(/^(\s*>\s*)(.*)$/);
      if (blockquoteMatch) {
        wrapped = wrapWithPrefix(blockquoteMatch[1], blockquoteMatch[2], maxLen);
      } else {
        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
        if (listMatch) {
          const indent = listMatch[1];
          const marker = listMatch[2];
          const rest = listMatch[3];
          const prefix = indent + marker + " ";
          const continuation = indent + "  ";
          wrapped = wrapWithPrefix(prefix, rest, maxLen, continuation);
        } else {
          wrapped = wrapLine(line, maxLen);
        }
      }
      if (wrapped.length <= 1) continue;
      const firstLine = wrapped[0];
      const insertText = "\n" + wrapped.slice(1).join("\n");
      const lineNumber = i + 1;
      onError({
        lineNumber,
        detail: "Line too long",
        context: line,
        fixInfo: {
          lineNumber,
          editColumn: firstLine.length + 1,
          deleteCount: line.length - firstLine.length,
          insertText,
        },
      });
    }
  },
};
