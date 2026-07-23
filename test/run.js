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

// MD013-fix: inline markdown links must not be split across lines
const withInlineLinks = "# Links\n\nFor more details, see the [official documentation](https://docs.example.com/very/long/path/to/resource/page) for configuration options.\n";
const results7 = lint({
  strings: { "md013-links.md": withInlineLinks },
  config,
  customRules: extraFixes,
});
const fixed7 = applyFixes(withInlineLinks, results7["md013-links.md"] || []);
const linkRe = /\[[^\]]*\]\([^)]*\)/g;
const origLinks = withInlineLinks.match(linkRe) || [];
const fixedLinks = fixed7.match(linkRe) || [];
if (origLinks.length !== fixedLinks.length || origLinks[0] !== fixedLinks[0]) {
  console.error("Expected MD013-fix to preserve inline links. Original:", origLinks, "Fixed:", fixedLinks);
  console.error("Fixed content:\n", fixed7);
  process.exit(1);
}

// MD041-fix: must not fire when set to false
const noHeading = "Just a paragraph without a heading.\n";
const resultsDisabled = lint({
  strings: { "disabled.md": noHeading },
  config: { default: true, MD041: false, "MD041-fix": false },
  customRules: extraFixes,
});
const md041Errors = (resultsDisabled["disabled.md"] || []).filter(
  (e) => e.ruleNames && e.ruleNames.includes("MD041-fix")
);
if (md041Errors.length > 0) {
  console.error("Expected MD041-fix: false to suppress the rule, got", md041Errors.length, "errors");
  process.exit(1);
}

// MD036-fix: bold text should become heading
const boldAsHeading = "# Title\n\n**Introduction**\n\nSome paragraph text.\n";
const results8 = lint({
  strings: { "md036.md": boldAsHeading },
  config,
  customRules: extraFixes,
});
const fixed8 = applyFixes(boldAsHeading, results8["md036.md"] || []);
if (!fixed8.includes("## Introduction")) {
  console.error("Expected MD036-fix to convert **Introduction** to ## Introduction. Got:\n", fixed8);
  process.exit(1);
}
if (fixed8.includes("**Introduction**")) {
  console.error("Expected MD036-fix to remove bold emphasis. Got:\n", fixed8);
  process.exit(1);
}

// MD013-fix: adjacent links separated by punctuation must not get a space inserted
const adjacentLinks = "# Test\n\nThis metric uses [`MET006`](MET006.md)–[`MET009`](MET009.md) when account-level data is available.\n";
const results9 = lint({
  strings: { "md013-adjacent.md": adjacentLinks },
  config,
  customRules: extraFixes,
});
const fixed9 = applyFixes(adjacentLinks, results9["md013-adjacent.md"] || []);
// The en-dash between the two links must remain directly adjacent (no inserted space)
if (fixed9.includes("–\n") || fixed9.includes("– [")) {
  console.error("Expected MD013-fix to not insert space/newline between adjacent links. Got:\n", fixed9);
  process.exit(1);
}

// MD013-fix: wrapping inside a list item must not produce a continuation starting with >
const listWithGt = "# Test\n\n- [`MET050`](MET050.md) — Frequency Count: > 1 OTD per customer in 12 months auto-escalates to Red\n";
const results10 = lint({
  strings: { "md013-blockquote.md": listWithGt },
  config,
  customRules: extraFixes,
});
const fixed10 = applyFixes(listWithGt, results10["md013-blockquote.md"] || []);
// No continuation line should start with "> " (blockquote marker)
const fixed10Lines = fixed10.split("\n");
for (let i = 0; i < fixed10Lines.length; i++) {
  const stripped = fixed10Lines[i].replace(/^\s+/, "");
  if (stripped.startsWith("> ") && !fixed10Lines[i].match(/^- /)) {
    console.error(`Expected MD013-fix to not create blockquote on continuation line ${i + 1}. Got:\n`, fixed10);
    process.exit(1);
  }
}

// MD013-fix: link followed by semicolon must not get separated
const linkThenSemicolon = "# T\n\n- **Origin:** [Policy](https://docs.google.com/document/d/1CaCSy5cNPdg9FbnVedojALEE6TLfTekAv5vAJGJFE8Q/edit); [Amendment](https://docs.google.com/document/d/other)\n";
const results11 = lint({
  strings: { "md013-semicolon.md": linkThenSemicolon },
  config,
  customRules: extraFixes,
});
const fixed11 = applyFixes(linkThenSemicolon, results11["md013-semicolon.md"] || []);
if (fixed11.includes(")\n  ;") || fixed11.includes(") ;")) {
  console.error("Expected MD013-fix to keep ); together after link. Got:\n", fixed11);
  process.exit(1);
}

// MD013-fix: link followed by period must not get separated
const linkThenPeriod = "# T\n\nSee [OPE BRD](https://docs.google.com/document/d/1fQ6Cg7y_ek_KRiFTpIYriwK0Ft1NfEFCxS1fdSdHr6A/edit?tab=t.4z667b7qxg43).\n";
const results12 = lint({
  strings: { "md013-period.md": linkThenPeriod },
  config,
  customRules: extraFixes,
});
const fixed12 = applyFixes(linkThenPeriod, results12["md013-period.md"] || []);
if (fixed12.includes(")\n.")) {
  console.error("Expected MD013-fix to keep ). together after link. Got:\n", fixed12);
  process.exit(1);
}

console.log("OK: MD040-fix, MD042-fix, MD022-fix, MD031-fix, MD033-fix (placeholder), MD013-fix (links, adjacent-links, no-blockquote, semicolon, period), MD041-fix (disable), MD036-fix (bold→heading) produced expected fixes; Perl without shebang correctly gets default language.");
