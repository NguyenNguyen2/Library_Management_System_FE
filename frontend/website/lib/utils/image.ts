// Backend cover_image is either a full URL (Google Books thumbnail from ISBN import)
// or a bare relative storage path like "book-covers/xxx.jpg" (manual upload via admin —
// no leading "/storage/", unlike avatar_url which already includes it). Browser (Next.js
// port 3000) must load the latter from Laravel (port 8000), so the base URL + "/storage/"
// segment has to be prepended.
export function toCoverImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
  return `${base}/storage/${path}`;
}
