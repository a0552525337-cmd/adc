const ALLOWED_ORIGIN = "https://a0552525337-cmd.github.io";
const XTREAM_API = "https://alf554562.online/player_api.php";
const ALLOWED_ACTIONS = new Set(["login", "get_live_categories", "get_live_streams"]);

function jsonResponse(body, status, origin) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });
  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (origin !== ALLOWED_ORIGIN) {
      return jsonResponse({ error: "This app origin is not allowed." }, 403, origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin",
        },
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return jsonResponse({ ok: true, service: "Xtream bridge" }, 200, origin);
    }

    if (url.pathname !== "/api/xtream" || request.method !== "POST") {
      return jsonResponse({ error: "Not found." }, 404, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON request." }, 400, origin);
    }

    const action = String(body?.action || "");
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!ALLOWED_ACTIONS.has(action)) {
      return jsonResponse({ error: "Unsupported Xtream action." }, 400, origin);
    }
    if (!username || !password || username.length > 160 || password.length > 256) {
      return jsonResponse({ error: "Enter valid subscription credentials." }, 400, origin);
    }

    const params = new URLSearchParams({ username, password });
    if (action !== "login") params.set("action", action);

    try {
      const upstream = await fetch(XTREAM_API + "?" + params.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });

      if (!upstream.ok) {
        return jsonResponse({ error: "Provider request failed.", providerStatus: upstream.status }, 502, origin);
      }

      const text = await upstream.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return jsonResponse({ error: "Provider returned a non-JSON response." }, 502, origin);
      }

      if (action === "login" && (!data?.user_info || String(data.user_info.auth) !== "1")) {
        return jsonResponse({ error: "Login was not accepted. Check the account details." }, 401, origin);
      }
      if (action !== "login" && !Array.isArray(data)) {
        return jsonResponse({ error: "Provider returned an invalid channel list." }, 502, origin);
      }

      return jsonResponse(data, 200, origin);
    } catch (error) {
      const timedOut = error?.name === "TimeoutError";
      return jsonResponse(
        { error: timedOut ? "Provider timed out." : "Could not reach the provider." },
        502,
        origin,
      );
    }
  },
};
