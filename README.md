# umami-dashboard

See all your [Umami](https://umami.is/) websites at a glance. This tool generates your personal Umami dashboard from a JSON file listing the sites you care about, in the order you want, with events and UTM breakdowns only where they make sense.

Everything on the dashboard is Umami's own live components, so the date picker and filters work as usual. The tool just builds the layout.

## Requirements

- Self-hosted Umami **v3.4+** (API keys and the personal dashboard)
- Node **22.9+**
- No dependencies

## Setup

1. In Umami, create an API key under **Settings → API keys**.
2. Copy the example files and fill them in:

   ```sh
   cp .env.example .env
   cp dashboard.config.example.json dashboard.config.json
   ```

   ```sh
   # .env
   UMAMI_URL=https://stats.example.com
   UMAMI_API_KEY=...
   ```

3. List your websites to see what you can put in the config:

   ```sh
   npm run sites
   ```

Both `.env` and `dashboard.config.json` are gitignored.

## Configuration

`dashboard.config.json` lists the sites in the order they appear on the dashboard. Refer to a site by its domain, name or id.

```json
{
  "sites": [
    {
      "site": "shop.example.com",
      "events": true,
      "utm": ["utm_source", "utm_campaign"]
    },
    "example.com",
    "blog.example.com"
  ]
}
```

Each site gets a row with its metrics bar (views, visitors, bounces, time on site) and visitors chart. Then:

| Option | Adds |
| --- | --- |
| *(plain string)* | Nothing else: traffic only |
| `"events": true` | An events chart and a top-10 events table |
| `"utm": [...]` | A UTM breakdown (list and pie chart) per parameter, two per row, in the order given. Valid params are `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and `utm_term` |

## Usage

Preview the layout without changing anything:

```sh
npm run dashboard -- --dry-run
```

```
shop  |  shop · Visitors
shop · Events  |  shop · Top events
shop · utm_source  |  shop · utm_campaign
example  |  example · Visitors
```

Apply it:

```sh
npm run dashboard
```

Then open `<UMAMI_URL>/dashboard`. To change anything, edit the config and run it again.

### Backups and restore

Saving **replaces the whole dashboard layout**, including any changes made in the Umami UI. Before every save, the current dashboard is written to `backups/dashboard-<timestamp>.json`. To put one back:

```sh
npm run restore -- backups/dashboard-2026-10-10T08-00-00-000Z.json
```

## Limitations

- **Event properties aren't shown.** Umami's dashboard has no component for event data. They're still available on each site's Events page.
- **Layout comes from Umami's internals.** The dashboard format isn't a documented API. It's taken from Umami's source, and a future Umami release could change it. Keep `--dry-run` and the backups in mind after upgrading.

## API key scope

An Umami API key has the full permissions of the user who created it, with no read-only option. This tool only reads your websites and reads and saves your own dashboard.

## Development

```sh
npm test
```

## License

MIT
