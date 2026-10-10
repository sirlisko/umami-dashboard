export function createClient(umamiUrl, apiKey) {
  return async function api(method, path, body) {
    const res = await fetch(`${umamiUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
    return res.json();
  };
}

export async function getWebsites(api) {
  const { data } = await api("GET", "/api/websites?pageSize=200");
  return data;
}

export function getDashboard(api) {
  return api("GET", "/api/dashboard");
}

// name and description are NOT NULL columns that /api/dashboard doesn't default.
export function saveDashboard(api, parameters) {
  return api("POST", "/api/dashboard", { name: "Dashboard", description: "", parameters });
}
