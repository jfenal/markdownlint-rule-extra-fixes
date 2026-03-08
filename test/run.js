/**
 * Simple test: lint content with our custom rule, apply fixes, assert output has language.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { lint } from "markdownlint/sync";
import { applyFixes } from "markdownlint";
import extraFixes from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fixturePath = join(__dirname, "fixture.md");
const fixture = readFileSync(fixturePath, "utf-8");

const config = {
  default: true,
  MD040: false,
  "MD040-fix": true,
  MD041: false,
  "MD041-fix": true,
  MD042: false,
  "MD042-fix": true,
  MD022: false,
  "MD022-fix": true,
  MD031: false,
  "MD031-fix": true,
  MD036: false,
  "MD036-fix": true,
  MD033: false,
  "MD033-fix": true,
  MD013: false,
  "MD013-fix": true,
  MD047: false,
  "MD047-fix": true,
};
const results = lint({
  strings: { "fixture.md": fixture },
  config,
  customRules: extraFixes,
});

const errors = results["fixture.md"];
if (!Array.isArray(errors)) {
  console.error("Expected errors array, got", errors);
  process.exit(1);
}

const withFix = errors.filter((e) => e.fixInfo);
if (withFix.length === 0) {
  console.error("Expected at least one error with fixInfo, got", errors.length, "errors");
  process.exit(1);
}

const fixed = applyFixes(fixture, errors);
if (!fixed.includes("```fixme") && !fixed.includes("```text") && !fixed.includes("```bash")) {
  console.error("Expected fixed content to contain ```fixme, ```text, or inferred language. Got:\n", fixed);
  process.exit(1);
}

const withEmptyLink = "See [here]() and [](#) for more.";
const results2 = lint({
  strings: { "links.md": withEmptyLink },
  config,
  customRules: extraFixes,
});
const fixed2 = applyFixes(withEmptyLink, results2["links.md"] || []);
if (!fixed2.includes("fixme_url")) {
  console.error("Expected MD042-fix to insert url_placeholder. Got:", fixed2);
  process.exit(1);
}

// Perl code without shebang is not inferred as "perl" (inferrer has no pattern for it).
// We allow that: the block gets default language (text). This test asserts that behavior.
const perlNoShebang = `# Doc

\`\`\`
my $name = shift;
while (<>) { chomp; say $_ if /$name/; }
\`\`\`
`;
const results3 = lint({
  strings: { "perl-no-shebang.md": perlNoShebang },
  config,
  customRules: extraFixes,
});
const fixed3 = applyFixes(perlNoShebang, results3["perl-no-shebang.md"] || []);
if (!fixed3.includes("```fixme")) {
  console.error("Expected Perl (no shebang) block to get default language 'fixme'. Got:\n", fixed3);
  process.exit(1);
}
if (fixed3.includes("```perl")) {
  console.error("Perl without shebang should not be inferred as perl (allowed to fail inference). Got:\n", fixed3);
  process.exit(1);
}

// MD022-fix: headings surrounded by blank lines
const noBlanksAroundHeadings = "text before\n# Heading\ntext after";
const results4 = lint({
  strings: { "md022.md": noBlanksAroundHeadings },
  config,
  customRules: extraFixes,
});
const fixed4 = applyFixes(noBlanksAroundHeadings, results4["md022.md"] || []);
if (!fixed4.includes("\n\n# Heading\n\n")) {
  console.error("Expected MD022-fix to add blank lines around heading. Got:\n", JSON.stringify(fixed4));
  process.exit(1);
}

// MD031-fix: blanks around fenced code blocks
const noBlanksAroundFence = "paragraph\n```\ncode\n```\nparagraph";
const results5 = lint({
  strings: { "md031.md": noBlanksAroundFence },
  config,
  customRules: extraFixes,
});
const fixed5 = applyFixes(noBlanksAroundFence, results5["md031.md"] || []);
if (!fixed5.includes("\n\n```") || !fixed5.includes("```\n\nparagraph")) {
  console.error("Expected MD031-fix to add blank lines around fenced block. Got:\n", JSON.stringify(fixed5));
  process.exit(1);
}

// MD033-fix: placeholder-style angle brackets in invocation examples are not wrapped as HTML
const invocationExample = "Use --output=<path> and <value> in config.";
const results6 = lint({
  strings: { "md033-placeholder.md": invocationExample },
  config,
  customRules: extraFixes,
});
const fixed6 = applyFixes(invocationExample, results6["md033-placeholder.md"] || []);
if (fixed6.includes("`<path>`") || fixed6.includes("`<value>`")) {
  console.error("Expected MD033-fix to leave placeholder tags <path> and <value> unchanged. Got:", fixed6);
  process.exit(1);
}
if (!fixed6.includes(" and <value> ")) {
  console.error("Expected <value> to remain unwrapped. Got:", fixed6);
  process.exit(1);
}
// Real HTML without attribute should still be wrapped when not in placeholder list
const withSpan = "See <span>here</span>.";
const results6b = lint({
  strings: { "md033-span.md": withSpan },
  config,
  customRules: extraFixes,
});
const fixed6b = applyFixes(withSpan, results6b["md033-span.md"] || []);
if (!fixed6b.includes("`<span>") || !fixed6b.includes("</span>`")) {
  console.error("Expected MD033-fix to wrap <span> in backticks. Got:", fixed6b);
  process.exit(1);
}

console.log("OK: MD040-fix, MD042-fix, MD022-fix, MD031-fix, MD033-fix (placeholder) produced expected fixes; Perl without shebang correctly gets default language.");
