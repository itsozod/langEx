/**
 * Mirrors the URL shape Gifted Chat's `LinkParser` turns into a link, so the message menu offers
 * exactly the links the bubble renders. Its own parser is internal and not exported, which is why
 * the pattern lives here too; keep the two in step when the library is upgraded.
 */
const URL_PATTERN =
  /(?:https?:\/\/(?:www\.)?|www\.)[^\s]+|(?<![A-Za-z0-9_.@])(?![A-Za-z0-9._%+-]*@)[a-zA-Z0-9][a-zA-Z0-9-]*\.(?!@)[a-zA-Z]{2,}(?![A-Za-z0-9._%+-]*@)(?:\/[^\s]*)?/gi;

const MAX_LABEL_LENGTH = 26;

export type MessageLink = {
  /** Shortened form for a menu row, e.g. `expo.dev/go` */
  label: string;
  /** The link exactly as it appears in the message. */
  text: string;
  /** Always carries a scheme, so it can be copied or opened as-is. */
  url: string;
};

function toLabel(match: string) {
  const bare = match.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  if (bare.length <= MAX_LABEL_LENGTH) return bare;
  return `${bare.slice(0, MAX_LABEL_LENGTH - 1)}…`;
}

export function findMessageLinks(text: string): MessageLink[] {
  const links: MessageLink[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(URL_PATTERN)) {
    const matched = match[0];
    const url = /^https?:\/\//i.test(matched) ? matched : `http://${matched}`;
    if (seen.has(url)) continue;

    seen.add(url);
    links.push({ label: toLabel(matched), text: matched, url });
  }

  return links;
}
