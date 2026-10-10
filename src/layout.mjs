import { randomUUID } from "node:crypto";

const UTM_ROW_SIZE = 2;

export function resolveSites(entries, websites) {
  return entries.map((entry) => {
    const website = websites.find((w) => [w.id, w.domain, w.name].includes(entry.site));
    if (!website) throw new Error(`No website matches "${entry.site}". Run "npm run sites" to list them.`);
    return { ...entry, website };
  });
}

export function buildRows(sites) {
  return sites.flatMap(({ website, events, utm }) => [
    row(
      component("WebsiteMetricsBar", website, website.name),
      component("WebsiteChart", website, `${website.name} · Visitors`),
    ),
    ...(events ? [eventsRow(website)] : []),
    ...chunk(utm, UTM_ROW_SIZE).map((params) => row(...params.map((param) => utmComponent(website, param)))),
  ]);
}

function eventsRow(website) {
  return row(
    component("EventsChart", website, `${website.name} · Events`),
    component("MetricsTable", website, `${website.name} · Top events`, { type: "event", limit: 10 }),
  );
}

function utmComponent(website, param) {
  return component("UTM", website, `${website.name} · ${param}`, { param, limit: 10 });
}

function row(...components) {
  return {
    id: randomUUID(),
    columns: components.map((component) => ({ id: randomUUID(), component })),
  };
}

function chunk(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
}

// Umami resolves a component's site from entityType/entityId on newer boards and
// websiteId on older ones, so both are set.
function component(type, website, title, props) {
  return {
    type,
    title,
    entityType: "website",
    entityId: website.id,
    websiteId: website.id,
    ...(props && { props }),
  };
}
