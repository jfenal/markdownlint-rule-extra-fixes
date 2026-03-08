/**
 * Heuristic inference of code block language from content.
 * Best-effort; returns "text" when unknown.
 */
export function inferLanguage(content) {
  const trimmed = content.trim();
  if (!trimmed) return "text";

  const firstLine = trimmed.split("\n")[0] ?? "";
  const firstFewLines = trimmed.split("\n").slice(0, 5).join("\n");

  if (/^#!\s*\/usr\/bin\/env\s+bash/.test(firstLine) || /^#!\s*\/bin\/bash/.test(firstLine) || /^#!\s*\/bin\/sh\b/.test(firstLine)) return "bash";
  if (/^#!\s*\/usr\/bin\/env\s+python/.test(firstLine) || /^#!\s*\/usr\/bin\/python/.test(firstLine)) return "python";
  if (/^#!\s*\/usr\/bin\/env\s+node/.test(firstLine)) return "javascript";
  if (/^#!\s*\/usr\/bin\/env\s+ruby/.test(firstLine)) return "ruby";
  if (/^#!\s*\/usr\/bin\/env\s+perl/.test(firstLine)) return "perl";
  if (trimmed.includes("<?php")) return "php";
  if (/<\s*!?DOCTYPE\s+html/i.test(trimmed) || /<\s*html\b/i.test(firstLine)) return "html";
  if (/^\s*[\{\[]/.test(trimmed) && (/^\s*["']?\w+["']?\s*:/.test(trimmed) || /["']\w+["']\s*:/.test(trimmed))) return "json";
  if (/\bSELECT\b.*\bFROM\b/is.test(trimmed) || /\bINSERT\s+INTO\b/is.test(trimmed) || /\bUPDATE\s+\w+\s+SET\b/is.test(trimmed)) return "sql";
  if (/\bdef\s+\w+\s*\(/.test(firstFewLines) || /^\s*import\s+\w+/.test(firstLine) || /^\s*from\s+\w+\s+import/.test(firstLine)) return "python";
  if (/\bfunction\s+\w+\s*\(/.test(firstFewLines) || /\b=>\s*{?/.test(firstFewLines) || /^\s*const\s+\w+\s*=/.test(firstLine) || /^\s*export\s+/.test(firstLine)) return "javascript";
  if (/package\s+main\b/.test(firstLine) || /\bfunc\s+main\s*\(/.test(firstFewLines)) return "go";
  if (/\bfn\s+main\s*\(/.test(firstFewLines)) return "rust";
  if (/^\s*#\s*include\s*</.test(firstLine)) return firstFewLines.includes("std::") ? "cpp" : "c";
  if (/^\s*[\w-]+\s*:\s*.+$/m.test(firstFewLines) && !trimmed.startsWith("{")) return "yaml";
  if (/^---\s*$/.test(firstLine)) return "yaml";
  if (/^\s*\$\s+/.test(firstLine) || /^\s*(curl|wget|npm|git|docker)\s+/.test(firstLine)) return "bash";

  return "text";
}
