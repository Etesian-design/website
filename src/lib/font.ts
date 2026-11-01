/**
 * The site's typeface: the highest-scoring free look-alike from the design repo's font list (never Nokia Pure, which is
 * proprietary and only ever referenced through local()).
 */
import { FONT_ALTERNATIVES, fontVars } from '@etesian/fonts';
export const siteFontInfo = FONT_ALTERNATIVES.find((f) => f.key !== 'nokia-pure')!;
export const siteFont = fontVars(siteFontInfo.key);
