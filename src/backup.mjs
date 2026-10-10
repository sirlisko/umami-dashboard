import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BACKUP_DIR = "backups";

export function writeBackup(dashboard) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const path = join(BACKUP_DIR, `dashboard-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(path, `${JSON.stringify(dashboard, null, 2)}\n`);
  return path;
}

export function readBackup(path) {
  const { parameters } = JSON.parse(readFileSync(path, "utf8"));
  if (!parameters?.rows) throw new Error(`${path} has no dashboard layout to restore.`);
  return parameters;
}
