/** Each generated page's title, description and canonical address (Quasar Meta plugin, written into the SSG HTML). */
import { useMeta } from 'quasar';
const SITE = 'https://etesian-design.com';
export function usePageMeta(title: string, description: string, path: string) {
  useMeta({
    title,
    meta: {
      description: { name: 'description', content: description },
      ogTitle: { property: 'og:title', content: title },
      ogDescription: { property: 'og:description', content: description },
      ogUrl: { property: 'og:url', content: SITE + path },
    },
    link: { canonical: { rel: 'canonical', href: SITE + path } },
  });
}
