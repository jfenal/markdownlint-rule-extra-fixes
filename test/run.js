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

console.log("OK: MD040-fix and MD042-fix produced expected fixes; Perl without shebang correctly gets default language.");
