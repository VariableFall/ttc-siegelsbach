/**
 * Gemeinsames Ausgabe-Schema für tabellen.json und spielplan.json.
 * Wird von fetch.mjs und demo-daten.mjs identisch verwendet.
 */

export function teamLabel(name, override) {
  if (override) return override;
  if (name.startsWith('TTC')) return name;
  if (name === 'I') return 'TTC Siegelsbach';
  return `TTC Siegelsbach ${name}`;
}

export function myttGruppeUrl(config, mannschaft, seite) {
  const { verband, saison } = config;
  const { leagueSlug, groupId } = mannschaft;
  const slug = leagueSlug || 'x';
  return `https://www.mytischtennis.de/click-tt/${verband}/${saison}/ligen/${slug}/gruppe/${groupId}/${seite}/gesamt`;
}

export function createDateiKopf(config, demo) {
  return {
    stand: new Date().toISOString(),
    quelle: demo ? 'demo' : 'mytischtennis.de',
    demo,
    verband: config.verband,
    saison: config.saison,
    vereinsId: config.vereinsId,
    vereinsSlug: config.vereinsSlug,
    mannschaften: [],
  };
}

export function createMannschaftBasis(config, mannschaft) {
  return {
    name: mannschaft.name,
    ligaName: mannschaft.ligaName,
    leagueSlug: mannschaft.leagueSlug,
    groupId: mannschaft.groupId,
    teamName: teamLabel(mannschaft.name, mannschaft.teamName),
    myttTabelleUrl: myttGruppeUrl(config, mannschaft, 'tabelle'),
    myttSpielplanUrl: myttGruppeUrl(config, mannschaft, 'spielplan'),
  };
}

export function normalizeTabellenZeile(row, eigenesTeam) {
  const spiele = Number(row.meetings_count ?? 0);
  const punkteWon = row.points_won ?? '0';
  const punkteLost = row.points_lost ?? '0';

  return {
    platz: Number(row.table_rank ?? 0),
    mannschaft: row.team_name ?? '–',
    spiele,
    siege: Number(row.meetings_won ?? 0),
    niederlagen: Number(row.meetings_lost ?? 0),
    punkte: `${punkteWon}:${punkteLost}`,
    diff: row.matches_relation ?? row.sets_relation ?? '–',
    eigenesTeam: Boolean(eigenesTeam),
  };
}

export function normalizeSpiel(row) {
  const date = new Date(row.date);
  let isoDatum = null;
  let uhrzeit = null;

  if (!Number.isNaN(date.getTime())) {
    const parts = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
    isoDatum = `${get('year')}-${get('month')}-${get('day')}`;
    uhrzeit = `${get('hour')}:${get('minute')}`;
  }

  const ergebnis =
    row.state === 'done' && row.matches_won != null && row.matches_lost != null
      ? `${row.matches_won}:${row.matches_lost}`
      : null;

  return {
    datum: isoDatum,
    uhrzeit,
    heim: row.team_home ?? '–',
    gast: row.team_away ?? '–',
    ergebnis,
    status: row.state ?? 'unknown',
    ort: row.location?.label ?? null,
  };
}

export function isEigenesTeam(teamName, mannschaft) {
  const label = teamLabel(mannschaft.name, mannschaft.teamName);
  if (!teamName || !label) return false;
  if (teamName === label) return true;
  if (mannschaft.name === 'I' && label === 'TTC Siegelsbach') {
    return teamName === 'TTC Siegelsbach';
  }
  return teamName.includes(label);
}
