/**
 * Local API for the browser UI. Runs your existing CelescClient on the server.
 * Dev-only: one in-memory session, not safe for production.
 */
import "dotenv/config";
import cors from "cors";
import express from "express";
import { CelescClient } from "./services/celesc-client.js";

const PORT = Number(process.env.CELESC_DEV_API_PORT ?? 3456);
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "256kb" }));

let activeClient: CelescClient | null = null;
/** Last successful portal login (for client-side cache namespacing). */
let sessionUsername: string | null = null;

function makeClient(loginCookie?: string): CelescClient {
  const prev = process.env.CELESC_LOGIN_COOKIE;
  try {
    if (loginCookie?.trim()) {
      process.env.CELESC_LOGIN_COOKIE = loginCookie.trim();
    } else {
      delete process.env.CELESC_LOGIN_COOKIE;
    }
    return new CelescClient();
  } finally {
    if (prev !== undefined) process.env.CELESC_LOGIN_COOKIE = prev;
    else delete process.env.CELESC_LOGIN_COOKIE;
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/session", (_req, res) => {
  res.json({
    authenticated: Boolean(activeClient?.sessionStore.isAuthenticated()),
    ...(sessionUsername ? { username: sessionUsername } : {}),
  });
});

app.post("/api/login", async (req, res) => {
  try {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");
    const loginCookie =
      typeof req.body?.loginCookie === "string" ? req.body.loginCookie : "";
    if (!username || !password) {
      res.status(400).json({ error: "username and password required" });
      return;
    }
    activeClient = makeClient(loginCookie || undefined);
    await activeClient.signInWithPassword(username, password);
    sessionUsername = username;
    res.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(401).json({ error: msg });
  }
});

app.post("/api/logout", async (_req, res) => {
  try {
    if (activeClient) {
      await activeClient.signOut();
    }
  } finally {
    activeClient = null;
    sessionUsername = null;
  }
  res.json({ ok: true });
});

function clientOr401(res: express.Response): CelescClient | null {
  if (!activeClient?.sessionStore.isAuthenticated()) {
    res.status(401).json({ error: "Not logged in" });
    return null;
  }
  return activeClient;
}

app.get("/api/navbars", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const channelCode = String(req.query.channelCode ?? "WEB");
    const data = await client.getNavbars(channelCode);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/request-trackings", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const input = {
      channel: String(req.query.channel ?? "WEB"),
      partner: String(req.query.partner ?? ""),
      installation: String(req.query.installation ?? ""),
    };
    const data = await client.getAllRequestTrackings(input);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/request-tracking-status", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const protocol = String(req.query.protocol ?? "").trim();
    if (!protocol) {
      res.status(400).json({ error: "protocol query parameter required" });
      return;
    }
    const input = {
      channel: String(req.query.channel ?? "WEB"),
      protocol,
    };
    const data = await client.getRequestTrackingStatus(input);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/consumer-unit-types", async (_req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const data = await client.getConsumerUnitTypes();
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/unit-selection-page", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const channelCode = String(req.query.channelCode ?? "WEB");
    const pageName = String(
      req.query.pageName ?? "unit-selection-individuals-global",
    );
    const data = await client.getUnitSelectionPage(channelCode, pageName);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/contracts", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const data = await client.getAllContracts({
      partner: String(req.query.partner ?? ""),
      profileType: req.query.profileType
        ? String(req.query.profileType)
        : "GRPB",
      installation: req.query.installation
        ? String(req.query.installation)
        : null,
      owner: req.query.owner ? String(req.query.owner) : null,
      zipCode: req.query.zipCode ? String(req.query.zipCode) : null,
    });
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/footers", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const channelCode = String(req.query.channelCode ?? "WEB");
    const profileType = String(req.query.profileType ?? "GRPB");
    const data = await client.getFooters(channelCode, profileType);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.get("/api/scheduling-configs", async (_req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const data = await client.getSchedulingConfigs();
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

/** Navbars + footers + scheduling + consumer unit types in one GraphQL round trip. */
app.get("/api/cms/layout", async (req, res) => {
  try {
    const client = clientOr401(res);
    if (!client) return;
    const channelCode = String(req.query.channelCode ?? "WEB");
    const profileType = String(req.query.profileType ?? "GRPB");
    const data = await client.getCmsLayoutBundle(channelCode, profileType);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.info(`Celesc dev API http://127.0.0.1:${PORT} (Vite proxies /api here)`);
});
