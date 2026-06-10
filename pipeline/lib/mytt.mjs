const BASE_URL = 'https://www.mytischtennis.de';
const USER_AGENT = 'TTC-Siegelsbach-Website/1.0 (+https://github.com/ttc-siegelsbach)';

const ROUTE_TABELLE =
  'routes/click-tt+/$association+/$season+/$type+/$groupname.gruppe.$urlid+/tabelle.$filter';
const ROUTE_SPIELPLAN =
  'routes/click-tt+/$association+/$season+/$type+/$groupname.gruppe.$urlid+/spielplan.$filter';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(minMs = 1000, maxMs = 2000) {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  return sleep(ms);
}

function buildUrl(config, mannschaft, seite) {
  const { verband, saison } = config;
  const slug = mannschaft.leagueSlug || 'x';
  const { groupId } = mannschaft;
  const route = seite === 'tabelle' ? ROUTE_TABELLE : ROUTE_SPIELPLAN;
  const params = new URLSearchParams({ _data: route });
  return `${BASE_URL}/click-tt/${verband}/${saison}/ligen/${slug}/gruppe/${groupId}/${seite}/gesamt?${params}`;
}

export async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} für ${url}`);
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error(`Ungültige JSON-Antwort von ${url}`);
  }

  if (json.error) {
    const msg =
      typeof json.error === 'string'
        ? json.error
        : json.error.message ?? JSON.stringify(json.error);
    throw new Error(`API-Fehler: ${msg}`);
  }

  return json;
}

export async function fetchTabelle(config, mannschaft) {
  const url = buildUrl(config, mannschaft, 'tabelle');
  const json = await fetchJson(url);

  if (!json.data || !Array.isArray(json.data.league_table)) {
    throw new Error(`Keine Tabellendaten für ${mannschaft.name} (${mannschaft.groupId})`);
  }

  if (json.data.league_table.length === 0) {
    throw new Error(`Leere Tabelle für ${mannschaft.name} (${mannschaft.groupId})`);
  }

  return json;
}

export async function fetchSpielplan(config, mannschaft) {
  const url = buildUrl(config, mannschaft, 'spielplan');
  const json = await fetchJson(url);

  if (!json.data || !Array.isArray(json.data.meetings)) {
    throw new Error(`Keine Spielplandaten für ${mannschaft.name} (${mannschaft.groupId})`);
  }

  return json;
}

export function flattenMeetings(meetings) {
  const result = [];

  for (const dayEntry of meetings) {
    if (!dayEntry || typeof dayEntry !== 'object') continue;

    for (const value of Object.values(dayEntry)) {
      const items = Array.isArray(value) ? value : [value];
      for (const meeting of items) {
        if (meeting && typeof meeting === 'object' && meeting.team_home) {
          result.push(meeting);
        }
      }
    }
  }

  return result;
}
