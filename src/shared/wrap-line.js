// Match link chains: optional leading paren, a link, optional trailing
// punctuation, then optionally more links glued on
// (e.g. `([A](a.md)–[B](b.md))`). Trailing non-space/non-`[` chars after
// the last `)` are included (e.g. `[text](url).` keeps the period attached).
const LINK_RE = /\(?!?\[[^\]]*\]\([^)]*\)(?:[^\s\[]*!?\[[^\]]*\]\([^)]*\))*[^\s\[]*/g;

function findLinkCrossing(text, maxLength) {
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    const linkStart = m.index;
    const linkEnd = m.index + m[0].length;
    if (linkStart < maxLength && linkEnd > maxLength) {
      const spaceBefore = text.lastIndexOf(" ", linkStart - 1);
      if (spaceBefore > 0) return spaceBefore;
      if (linkStart > 0) return linkStart;
      return linkEnd;
    }
  }
  return null;
}

function adjustForLinks(text, breakAt) {
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    const linkStart = m.index;
    const linkEnd = m.index + m[0].length;
    if (breakAt > linkStart && breakAt < linkEnd) {
      const spaceBefore = text.lastIndexOf(" ", linkStart - 1);
      if (spaceBefore > 0) return spaceBefore;
      if (linkStart > 0) return linkStart;
      return linkEnd;
    }
  }
  // Don't break immediately before a link (inserting a newline between
  // adjacent punctuation and a link changes rendered HTML).
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    const linkStart = m.index;
    if (breakAt > 0 && breakAt === linkStart) {
      const spaceBefore = text.lastIndexOf(" ", linkStart - 1);
      if (spaceBefore > 0) return spaceBefore;
    }
  }
  return breakAt;
}

// Characters that act as markdown block markers when they start a line.
const MD_BLOCK_START = /^(?:>|#{1,6}\s|[-*+]\s|\d+\.\s)/;

/**
 * Wrap a single line to maxLength, breaking at sentence/word boundaries.
 */
export function wrapLine(line, maxLength) {
  const out = [];
  let remaining = line;
  while (remaining.length > maxLength) {
    const linkBreak = findLinkCrossing(remaining, maxLength);
    if (linkBreak !== null) {
      out.push(remaining.slice(0, linkBreak).trimEnd());
      remaining = remaining.slice(linkBreak).replace(/^\s+/, "");
      continue;
    }

    const chunk = remaining.slice(0, maxLength + 1);
    const sentenceMatch = chunk.match(/(.*[.!?])\s+(\S*)$/);
    const breakAtSentence = sentenceMatch ? sentenceMatch[1].length : -1;
    const lastSpace = chunk.lastIndexOf(" ");
    let breakAt = -1;
    if (breakAtSentence > maxLength * 0.4) breakAt = breakAtSentence;
    else if (lastSpace > maxLength * 0.3) breakAt = lastSpace;
    if (breakAt <= 0) {
      const upTo = remaining.slice(0, maxLength + 1);
      const urlStart =
        upTo.indexOf("https://") >= 0 ? upTo.indexOf("https://") : upTo.indexOf("http://");
      if (urlStart >= 0) {
        const before = remaining.slice(0, urlStart).trimEnd();
        const spaceBefore = before.lastIndexOf(" ");
        if (spaceBefore > 0) {
          out.push(remaining.slice(0, spaceBefore).trimEnd());
          remaining = remaining.slice(spaceBefore + 1);
          continue;
        }
      }
      breakAt = maxLength;
    }
    breakAt = adjustForLinks(remaining, breakAt);
    // Ensure the continuation line doesn't start with a markdown block marker
    // (e.g. "> " would become a blockquote, "- " a list item).
    let tail = remaining.slice(breakAt).replace(/^\s+/, "");
    if (MD_BLOCK_START.test(tail) && breakAt > 0) {
      // Try an earlier break point that avoids the marker
      const earlier = remaining.lastIndexOf(" ", breakAt - 1);
      if (earlier > maxLength * 0.3) {
        const altTail = remaining.slice(earlier).replace(/^\s+/, "");
        if (!MD_BLOCK_START.test(altTail)) {
          breakAt = earlier;
          tail = altTail;
        }
      }
      // If no safe earlier break, try a later one
      if (MD_BLOCK_START.test(tail)) {
        const later = remaining.indexOf(" ", breakAt + 1);
        if (later > 0 && later <= remaining.length) {
          const altTail = remaining.slice(later).replace(/^\s+/, "");
          if (!MD_BLOCK_START.test(altTail)) {
            breakAt = later;
          }
        }
      }
    }
    out.push(remaining.slice(0, breakAt).trimEnd());
    remaining = remaining.slice(breakAt).replace(/^\s+/, "");
  }
  if (remaining.length > 0) out.push(remaining);
  return out;
}

/**
 * Wrap content with a first-line prefix and optional continuation prefix (e.g. list, blockquote).
 */
export function wrapWithPrefix(prefix, content, maxLen, continuationPrefix) {
  const cont = continuationPrefix ?? prefix;
  const firstMax = Math.max(20, maxLen - prefix.length);
  const contMax = Math.max(20, maxLen - cont.length);
  if (content.length <= firstMax) return [prefix + content];
  const wrapped = wrapLine(content, firstMax);
  const out = [prefix + wrapped[0]];
  for (const segment of wrapped.slice(1)) {
    const sub = segment.length <= contMax ? [segment] : wrapLine(segment, contMax);
    for (const s of sub) out.push(cont + s);
  }
  return out;
}
