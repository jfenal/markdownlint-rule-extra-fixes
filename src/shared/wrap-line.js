/**
 * Wrap a single line to maxLength, breaking at sentence/word boundaries.
 */
export function wrapLine(line, maxLength) {
  const out = [];
  let remaining = line;
  while (remaining.length > maxLength) {
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
