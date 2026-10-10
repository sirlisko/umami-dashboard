import assert from "node:assert/strict";
import { test } from "node:test";
import { buildRows, resolveSites } from "./layout.mjs";

const websites = [
  { id: "id-a", domain: "a.com", name: "Site A" },
  { id: "id-b", domain: "b.com", name: "Site B" },
];

const entry = (site, extra) => ({ site, events: false, utm: [], ...extra });
const types = (rows) => rows.map((r) => r.columns.map((c) => c.component.type));

test("resolves sites by domain, name or id, keeping config order", () => {
  const sites = resolveSites([entry("id-b"), entry("Site A")], websites);
  assert.deepEqual(sites.map((s) => s.website.id), ["id-b", "id-a"]);
});

test("throws on an unknown site", () => {
  assert.throws(() => resolveSites([entry("nope.com")], websites), /No website matches "nope.com"/);
});

test("a traffic-only site gets one row", () => {
  const rows = buildRows(resolveSites([entry("a.com")], websites));
  assert.deepEqual(types(rows), [["WebsiteMetricsBar", "WebsiteChart"]]);
});

test("events and utm add rows, utm two per row in config order", () => {
  const sites = resolveSites(
    [entry("a.com", { events: true, utm: ["utm_campaign", "utm_source", "utm_medium"] }), entry("b.com")],
    websites,
  );
  const rows = buildRows(sites);

  assert.deepEqual(types(rows), [
    ["WebsiteMetricsBar", "WebsiteChart"],
    ["EventsChart", "MetricsTable"],
    ["UTM", "UTM"],
    ["UTM"],
    ["WebsiteMetricsBar", "WebsiteChart"],
  ]);
  assert.deepEqual(
    rows.slice(2, 4).flatMap((r) => r.columns.map((c) => c.component.props.param)),
    ["utm_campaign", "utm_source", "utm_medium"],
  );
  assert.deepEqual(rows[1].columns[1].component.props, { type: "event", limit: 10 });
  assert.deepEqual(rows.map((r) => r.columns[0].component.entityId), ["id-a", "id-a", "id-a", "id-a", "id-b"]);
});
