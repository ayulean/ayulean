/**
 * Reviews go live the moment a customer writes them — no waiting on approval.
 *
 * The one exception is anything carrying a link. Review spam is almost always
 * link spam, and a genuine customer describing a supplement has no reason to
 * paste a URL. Those are held so an admin can look before they appear, instead
 * of letting the store publish someone else's advertising.
 */
const LINK_PATTERNS = [
  /https?:\/\//i,
  /\bwww\./i,
  // bare domains like "buycheap.shop" or "t.me/xyz"
  /\b[a-z0-9-]+\.(com|net|org|in|co|io|shop|store|xyz|ru|cn|info|biz|online|site|top|link|me|ly)\b/i,
  /<\s*a[\s>]/i,
];

export function containsLink(text: string): boolean {
  return LINK_PATTERNS.some((re) => re.test(text));
}

/** Whether a freshly submitted review can be published straight away. */
export function shouldAutoApprove(input: { title: string; body: string; name: string }): boolean {
  return !containsLink(`${input.name} ${input.title} ${input.body}`);
}
