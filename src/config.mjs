import { readFileSync } from "node:fs";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function loadEnv() {
  const { UMAMI_URL, UMAMI_API_KEY } = process.env;
  if (!UMAMI_URL || !UMAMI_API_KEY) throw new Error("Set UMAMI_URL and UMAMI_API_KEY (see .env.example).");
  return { umamiUrl: UMAMI_URL.replace(/\/$/, ""), apiKey: UMAMI_API_KEY };
}

export function loadSites(path = "dashboard.config.json") {
  let config;
  try {
    config = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new Error(`Can't read ${path}: ${e.message}. Copy dashboard.config.example.json to start.`);
  }

  const sites = (config.sites ?? []).map(parseSite);
  if (sites.length === 0) throw new Error(`Add at least one site to "sites" in ${path}.`);
  return sites;
}

export function parseSite(entry) {
  if (typeof entry === "string") return { site: entry, events: false, utm: [] };

  if (!entry?.site) throw new Error(`Each site needs a "site": ${JSON.stringify(entry)}`);

  const utm = entry.utm ?? [];
  const unknown = utm.filter((param) => !UTM_PARAMS.includes(param));
  if (unknown.length) {
    throw new Error(`Unknown utm param(s) for ${entry.site}: ${unknown.join(", ")}. Use ${UTM_PARAMS.join(", ")}.`);
  }

  return { site: entry.site, events: entry.events === true, utm };
}
