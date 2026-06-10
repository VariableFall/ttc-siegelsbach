// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: Repo-Name als base setzen (bei Umbenennung hier anpassen)
const REPO = 'ttc-siegelsbach';

export default defineConfig({
  output: 'static',
  site: `https://${REPO}.github.io`,
  base: `/${REPO}`,
});
