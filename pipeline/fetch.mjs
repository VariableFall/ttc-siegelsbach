#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchSpielplan, fetchTabelle, flattenMeetings, randomDelay } from './lib/mytt.mjs';
import {
  createDateiKopf,
  createMannschaftBasis,
  isEigenesTeam,
  normalizeSpiel,
  normalizeTabellenZeile,
} from './lib/schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONFIG_PATH = join(__dirname, 'config.json');
const OUT_TABELLEN = join(ROOT, 'public/data/tabellen.json');
const OUT_SPIELPLAN = join(ROOT, 'public/data/spielplan.json');

async function loadConfig() {
  const raw = await readFile(CONFIG_PATH, 'utf8');
  const config = JSON.parse(raw);

  if (!config.verband || !config.saison || !config.vereinsId || !config.vereinsSlug) {
    throw new Error('config.json: verband, saison, vereinsId und vereinsSlug sind Pflichtfelder');
  }

  if (!Array.isArray(config.mannschaften) || config.mannschaften.length === 0) {
    throw new Error('config.json: mannschaften-Array fehlt oder ist leer');
  }

  for (const m of config.mannschaften) {
    if (!m.name || !m.ligaName || !m.leagueSlug || !m.groupId) {
      throw new Error(`config.json: unvollständiger Mannschaftseintrag (${m.name ?? '?'})`);
    }
  }

  return config;
}

function buildTabellen(config, mannschaft, apiData) {
  const label = createMannschaftBasis(config, mannschaft);
  const zeilen = apiData.data.league_table
    .map((row) => normalizeTabellenZeile(row, isEigenesTeam(row.team_name, mannschaft)))
    .sort((a, b) => a.platz - b.platz);

  return {
    ...label,
    tabelle: zeilen,
  };
}

function buildSpielplan(config, mannschaft, apiData) {
  const label = createMannschaftBasis(config, mannschaft);
  const alle = flattenMeetings(apiData.data.meetings);
  const spiele = alle
    .filter(
      (m) =>
        isEigenesTeam(m.team_home, mannschaft) ||
        isEigenesTeam(m.team_away, mannschaft),
    )
    .map(normalizeSpiel)
    .sort((a, b) => {
      const da = a.datum ?? '';
      const db = b.datum ?? '';
      if (da !== db) return da.localeCompare(db);
      return (a.uhrzeit ?? '').localeCompare(b.uhrzeit ?? '');
    });

  return {
    ...label,
    spiele,
  };
}

async function main() {
  const config = await loadConfig();
  const tabellen = createDateiKopf(config, false);
  const spielplan = createDateiKopf(config, false);

  console.log(`Lade Daten für ${config.mannschaften.length} Mannschaft(en) …`);
  console.log(`Verband: ${config.verband}, Saison: ${config.saison}`);

  for (let i = 0; i < config.mannschaften.length; i++) {
    const mannschaft = config.mannschaften[i];
    console.log(`→ ${mannschaft.name} (${mannschaft.ligaName}, Gruppe ${mannschaft.groupId})`);

    const tabelleJson = await fetchTabelle(config, mannschaft);
    tabellen.mannschaften.push(buildTabellen(config, mannschaft, tabelleJson));

    await randomDelay();

    const spielplanJson = await fetchSpielplan(config, mannschaft);
    spielplan.mannschaften.push(buildSpielplan(config, mannschaft, spielplanJson));

    if (i < config.mannschaften.length - 1) {
      await randomDelay();
    }
  }

  const tabellenOut = `${JSON.stringify(tabellen, null, 2)}\n`;
  const spielplanOut = `${JSON.stringify(spielplan, null, 2)}\n`;

  await writeFile(OUT_TABELLEN, tabellenOut, 'utf8');
  await writeFile(OUT_SPIELPLAN, spielplanOut, 'utf8');

  console.log(`Geschrieben: ${OUT_TABELLEN}`);
  console.log(`Geschrieben: ${OUT_SPIELPLAN}`);
  console.log('Fertig.');
}

main().catch((err) => {
  console.error('FEHLER:', err.message);
  console.error('Bestehende JSON-Dateien wurden nicht verändert.');
  process.exit(1);
});
