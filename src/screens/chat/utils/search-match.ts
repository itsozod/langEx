/** Splits `text` around the first case-insensitive occurrence of `search` for highlighting. */
export function splitSearchMatch(text: string, search: string) {
  const query = search.trim();
  const index = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1;
  if (index < 0) return { before: text, match: '', after: '' };
  return {
    before: text.slice(0, index),
    match: text.slice(index, index + query.length),
    after: text.slice(index + query.length),
  };
}
