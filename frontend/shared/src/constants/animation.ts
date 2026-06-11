/**
 * Shared animation class strings for both admin and website.
 *
 * Tailwind utility strings (HOVER_CLICKABLE) work as-is in any Tailwind app.
 * Keyframe-based utilities (LOGO_HEARTBEAT → `.animate-heartbeat`) rely on
 * the `@keyframes heartbeat` rule declared in each app's global CSS
 * (admin/src/App.css and website/app/globals.css).
 *
 * Example:
 *   import { cn } from '@shared/constants/commonConst';
 *   import { HOVER_CLICKABLE, LOGO_HEARTBEAT } from '@shared/constants/animation';
 *
 *   <Card className={cn('rounded-[10px] border', HOVER_CLICKABLE)} ... />
 *   <Logo className={LOGO_HEARTBEAT} onClick={goHome} />
 */

/** Subtle scale + shadow on hover for any clickable card/row.
 *  Backed by the `.hover-clickable` CSS rule in each app's global
 *  stylesheet (website/globals.css, admin/App.css) — plain CSS so it works
 *  no matter how Tailwind is configured to scan content. */
export const HOVER_CLICKABLE = 'hover-clickable';

/** Infinite 3s heartbeat for brand logos. Pairs with click-to-home. */
export const LOGO_HEARTBEAT = 'animate-heartbeat cursor-pointer';
