// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: User/Org + Repo-Name (Projektseite unter username.github.io/repo/)
const GITHUB_USER = 'VariableFall';
const REPO = 'ttc-siegelsbach';

export default defineConfig({
  output: 'static',
  site: `https://${GITHUB_USER}.github.io`,
  base: `/${REPO}`,
});
