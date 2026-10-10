import { readBackup, writeBackup } from "./backup.mjs";
import { loadEnv, loadSites } from "./config.mjs";
import { buildRows, resolveSites } from "./layout.mjs";
import { createClient, getDashboard, getWebsites, saveDashboard } from "./umami.mjs";

const commands = { sites: listSites, dashboard: syncDashboard, restore: restoreDashboard };

async function listSites({ api }) {
  for (const w of await getWebsites(api)) console.log(`${w.domain}\t${w.name}\t${w.id}`);
}

async function syncDashboard({ api, umamiUrl }, args) {
  const sites = resolveSites(loadSites(), await getWebsites(api));
  const rows = buildRows(sites);

  if (args.includes("--dry-run")) {
    for (const row of rows) console.log(row.columns.map((c) => c.component.title).join("  |  "));
    return;
  }

  await save(api, { rows });
  console.log(`Saved dashboard with ${sites.length} site(s): ${umamiUrl}/dashboard`);
}

async function restoreDashboard({ api, umamiUrl }, [path]) {
  if (!path) throw new Error("Usage: npm run restore -- backups/<file>.json");
  await save(api, readBackup(path));
  console.log(`Restored dashboard from ${path}: ${umamiUrl}/dashboard`);
}

// Saving replaces the whole layout, so keep what was there first.
async function save(api, parameters) {
  const current = await getDashboard(api);
  if (current?.parameters?.rows) console.log(`Backed up current dashboard to ${writeBackup(current)}`);
  await saveDashboard(api, parameters);
}

const [name, ...args] = process.argv.slice(2);
const command = commands[name];

if (!command) {
  console.error(`Usage: node src/cli.mjs <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}

try {
  const { umamiUrl, apiKey } = loadEnv();
  await command({ api: createClient(umamiUrl, apiKey), umamiUrl }, args);
} catch (e) {
  console.error(e.cause ? `${e.message}: ${e.cause.message}` : e.message);
  process.exit(1);
}
