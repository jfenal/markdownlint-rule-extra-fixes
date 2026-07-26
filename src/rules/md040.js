/**
 * MD040: Fenced code blocks should have a language specified.
 * Reports fixInfo to insert default_language or inferred language after the opening fence.
 */
import { inferLanguage } from "../shared/infer-language.js";

const OPENING_NO_LANG = /^```\s*$/;
const OPENING_WITH_LANG = /^```\S/;

export default {
  names: ["MD040-fix"],
  description: "Fenced code blocks should have a language specified (fixable; use with MD040 disabled to avoid duplicate violations)",
  tags: ["code", "language"],
  parser: "none",
  function: function MD040(params, onError) {
    if (params.config === false) return;
    const lines = params.lines;
    const defaultLanguage = params.config?.default_language ?? "fixme";
    const useInference = params.config?.infer_language === true;

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (OPENING_NO_LANG.test(line)) {
        const lineNumber = i + 1;
        const blockLines = [];
        i++;
        while (i < lines.length && !OPENING_NO_LANG.test(lines[i])) {
          blockLines.push(lines[i]);
          i++;
        }
        const inferred = useInference ? inferLanguage(blockLines.join("\n")) : defaultLanguage;
        const language = inferred === "text" ? defaultLanguage : inferred;
        onError({
          lineNumber,
          detail: "Missing language after opening fence",
          context: line,
          fixInfo: {
            lineNumber,
            editColumn: 4,
            deleteCount: 0,
            insertText: language,
          },
        });
      } else if (OPENING_WITH_LANG.test(line)) {
        i++;
        while (i < lines.length && !OPENING_NO_LANG.test(lines[i])) {
          i++;
        }
      }
      i++;
    }
  },
};
