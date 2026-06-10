# TTC Siegelsbach – Vereinswebsite

Statische Website für den TTC Siegelsbach (Tischtennis im BATTV, Volleyball-Abteilung).
Gebaut mit [Astro](https://astro.build), gehostet auf GitHub Pages.

**Live:** https://variablefall.github.io/ttc-siegelsbach/

## Projektüberblick

| Bereich | Inhalt |
|---------|--------|
| `src/pages/` | Seiten (Start, Über uns, Training, Mannschaften, …) |
| `src/components/` | UI-Komponenten (Karte, Tabelle, Spielplan, …) |
| `src/data/` | Zentraler Import der JSON-Daten zur Build-Zeit |
| `public/data/` | Tabellen & Spielpläne (von der Pipeline geschrieben) |
| `pipeline/` | Datenabruf von mytischtennis.de |

Mannschaftsdaten werden **nicht** im Browser geladen, sondern zur Build-Zeit aus `public/data/*.json` eingelesen.

## Lokale Entwicklung

```bash
npm install
npm run dev          # http://localhost:4321/ttc-siegelsbach/
npm run build        # Produktions-Build nach dist/
npm run preview      # Build lokal testen
```

### Demo-Daten vs. Live-Daten

```bash
npm run data:demo    # Beispieldaten (demo: true) – bis zur Vereinsmeldung
npm run data:fetch   # Live-Abruf von mytischtennis.de (demo: false)
```

Nach Datenänderung: `npm run build` und Seite neu laden.

## Saisonwechsel

**Nur eine Datei anpassen:** `pipeline/config.json`

1. `saison` auf die neue Saison setzen (z. B. `"26--27"`)
2. Pro Mannschaft `ligaName`, `leagueSlug` und `groupId` von der [Mannschaften-Seite](https://www.mytischtennis.de/click-tt/BaTTV/25--26/verein/927/TTC_Siegelsbach/mannschaften) übernehmen
3. Optional `teamName`, falls mytischtennis abweichend benennt (z. B. `"TTC Siegelsbach"` statt `"TTC Siegelsbach I"`)
4. Lokal testen: `npm run data:fetch && npm run build`
5. Committen und pushen – der Cron-Workflow (`daten.yml`) übernimmt den Rest

## Deploy

Push auf `main` → GitHub Action **Deploy to GitHub Pages** baut und veröffentlicht.

Nach Daten-Updates (Cron Mo–So 06:00 & 22:00 UTC) committet **Daten aktualisieren** geänderte JSONs und triggert automatisch einen Neu-Build.

**GitHub Pages einrichten (einmalig – sonst 404!):**

1. Öffne https://github.com/VariableFall/ttc-siegelsbach/settings/pages
2. Unter **Build and deployment** → **Source:** `GitHub Actions` wählen (nicht „Deploy from a branch“)
3. Gehe zu **Actions** → Workflow **Deploy to GitHub Pages** → **Re-run all jobs**

Erst danach ist die Seite unter https://variablefall.github.io/ttc-siegelsbach/ erreichbar.
(Die Root-URL `variablefall.github.io` ohne `/ttc-siegelsbach/` zeigt immer 404 – das ist normal.)

### Eigene Domain (optional)

DNS-CNAME `www` oder `@` auf `variablefall.github.io` zeigen lassen, Domain in GitHub Pages Settings eintragen, `astro.config.mjs` → `site` anpassen.

## Launch-Checkliste

- [ ] Platzhalter ersetzt (Namen erst nach Einverständnis!)
- [ ] Impressum & Datenschutz vom Vorstand abgenommen
- [ ] **Juli 2026:** Ligen in `config.json`, `npm run data:fetch` lokal testen, Cron läuft → Demo-Hinweis verschwindet automatisch
- [ ] Eigene Domain? (z. B. `ttc-siegelsbach.de` via CNAME)
- [ ] Verein bei Google Maps / Gemeinde-Website verlinken lassen

## Lizenz

Website-Inhalte © TTC Siegelsbach e.V.
