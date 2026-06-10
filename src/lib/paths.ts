/** Interne URL mit Astro-base-Präfix (GitHub Pages: /ttc-siegelsbach/) */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  if (path === '/' || path === '') {
    return base;
  }

  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}
