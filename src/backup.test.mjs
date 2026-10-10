import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readBackup } from "./backup.mjs";

const file = (content) => {
  const path = join(mkdtempSync(join(tmpdir(), "umami-dashboard-")), "backup.json");
  writeFileSync(path, JSON.stringify(content));
  return path;
};

test("reads the layout from a backup", () => {
  const parameters = { rows: [{ id: "r1", columns: [] }] };
  assert.deepEqual(readBackup(file({ name: "Dashboard", parameters })), parameters);
});

test("rejects a file without a layout", () => {
  assert.throws(() => readBackup(file({ name: "Dashboard" })), /no dashboard layout/);
});
