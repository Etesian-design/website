/**
 * Plain links (not router links) to the site's own pages need the base path the site is served under ("/" on etesian-design.com,
 * or PUBLIC_PATH for a local test under a sub-path). Router links handle it already.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path: string) => BASE + path;
