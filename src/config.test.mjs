import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSite } from "./config.mjs";

test("a string is a traffic-only site", () => {
  assert.deepEqual(parseSite("a.com"), { site: "a.com", events: false, utm: [] });
});

test("an object opts into events and utm", () => {
  assert.deepEqual(parseSite({ site: "a.com", events: true, utm: ["utm_source"] }), {
    site: "a.com",
    events: true,
    utm: ["utm_source"],
  });
});

test("rejects a missing site and unknown utm params", () => {
  assert.throws(() => parseSite({ events: true }), /needs a "site"/);
  assert.throws(() => parseSite({ site: "a.com", utm: ["source"] }), /Unknown utm param\(s\) for a.com: source/);
});
