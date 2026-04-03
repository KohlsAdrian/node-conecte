import "./style.css";

type RequestTrackingRow = {
  protocol?: string;
  nameProtocol?: string;
  status?: string;
  description?: string;
  formatting?: string;
  createdDate?: string;
  finishedDate?: string;
};

type RequestTrackingsPayload = {
  getAllRequestTrackings?: {
    requestTrackings?: RequestTrackingRow[];
    message?: string;
    error?: string | boolean;
  };
};

type TrackingStatusStep = {
  link?: string;
  statusDatetime?: string;
  serviceclosed?: boolean;
  formatting?: string;
  protocol?: string;
  correction?: boolean;
  serviceCode?: string;
  nameService?: string;
  sequencial?: string;
  descriptionStep?: string;
  statusStep?: string;
  messageStep?: string;
};

type RequestTrackingStatusEntry = {
  channel?: string;
  accessId?: string;
  resultMessage?: string;
  resultCode?: string;
  protocol?: string;
  nameProtocol?: string;
  namePartner?: string;
  telephone?: string;
  cellphone?: string;
  email?: string;
  taxnum?: string;
  address?: string;
  type?: string;
  tabStatus?: TrackingStatusStep[];
};

type RequestTrackingStatusPayload = {
  getRequestTrackingStatus?: {
    requestTrackingStatus?: RequestTrackingStatusEntry[];
    message?: string;
    error?: string | boolean;
  };
};

type ContractsPayload = {
  allContracts?: {
    contracts?: Array<Record<string, unknown>>;
    message?: string;
    error?: string | boolean;
  };
};

/** Single `/api/cms/layout` response (navbars, footers, schedulingConfigs, consumerUnitTypes). */
type CmsLayoutPayload = {
  schedulingConfigs?: Array<{ isMaintenanceMode?: boolean | null }>;
};

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="app">
    <header class="site-header">
      <div class="site-header-inner">
        <div class="site-header-brand">
          <div class="logo-mark" aria-hidden="true"></div>
          <div>
            <span class="logo-title">Conecte</span>
            <span class="logo-sub">Sua energia em um só lugar</span>
          </div>
        </div>
        <div id="headerUser" class="header-user hidden" hidden>
          <div class="header-user-text">
            <span id="headerUserName" class="header-user-name"></span>
            <span id="headerUserEmail" class="header-user-email"></span>
          </div>
          <div class="header-user-actions">
            <button
              type="button"
              class="btn header-bar-btn"
              id="btnRefresh"
              aria-label="Atualizar instalações e solicitações"
            >
              Atualizar
            </button>
            <button type="button" class="btn header-bar-btn" id="btnLogout">Sair</button>
          </div>
        </div>
      </div>
    </header>

    <main class="content">
      <section class="intro">
        <h1>Consulte suas instalações e solicitações</h1>
        <p class="intro-text">
          Veja o endereço e os dados da unidade ligados à sua conta, e acompanhe o andamento dos seus pedidos na Celesc.
        </p>
      </section>

      <section class="surface login-surface" id="loginSection">
        <div id="loginFormPanel">
          <h2 class="surface-title">Acesso</h2>
          <p class="surface-lead">Use o mesmo e-mail e senha do portal Conecte.</p>
          <label class="field">
            <span class="field-label">E-mail</span>
            <input type="email" id="username" autocomplete="username" placeholder="seu@email.com" />
          </label>
          <label class="field">
            <span class="field-label">Senha</span>
            <input type="password" id="password" autocomplete="current-password" />
          </label>
          <label class="checkbox-field">
            <input type="checkbox" id="rememberMe" />
            <span>Lembrar e-mail e senha neste navegador</span>
          </label>
          <details class="login-extra">
            <summary>Não consegue entrar?</summary>
            <p class="login-extra-text">
              Em alguns casos é necessário colar o cabeçalho Cookie copiado do navegador após abrir o site oficial — use apenas se o suporte orientar.
            </p>
            <label class="field">
              <span class="field-label">Cookies (opcional)</span>
              <textarea id="loginCookie" rows="2" placeholder="Cole aqui somente se orientado"></textarea>
            </label>
            <p class="login-extra-actions">
              <button type="button" class="btn-text" id="btnForgetSaved">
                Apagar dados salvos neste aparelho
              </button>
            </p>
          </details>
          <div class="actions">
            <button type="button" class="btn primary" id="btnLogin">Entrar</button>
          </div>
        </div>
        <p id="loginStatus" class="feedback" role="status"></p>
      </section>

      <div id="dataArea" class="data-area hidden">
        <p id="maintenanceBanner" class="maintenance-banner data-area-banner hidden" role="status" hidden></p>

        <div class="dashboard-split">
          <section class="surface dashboard-panel" aria-labelledby="h-installations">
            <div class="surface-head">
              <h2 id="h-installations" class="surface-title">Minhas instalações</h2>
              <p class="surface-lead">Endereço, instalação e informações úteis da sua unidade consumidora.</p>
            </div>
            <div id="outInstallations" class="out-block out-block--fill">
              <p class="skeleton">Carregando…</p>
            </div>
          </section>

          <section class="surface dashboard-panel" aria-labelledby="h-requests">
            <div class="surface-head">
              <h2 id="h-requests" class="surface-title">Minhas solicitações</h2>
              <p class="surface-lead">Protocolos de serviços como religação, ligação nova e outros pedidos.</p>
            </div>
            <div id="outRequests" class="out-block out-block--fill">
              <p class="skeleton">Carregando…</p>
            </div>
          </section>
        </div>
      </div>

      <section class="surface quick-links" aria-labelledby="h-quick">
        <div class="surface-head">
          <h2 id="h-quick" class="surface-title">Outros serviços</h2>
          <p class="surface-lead">
            Atalhos para o site oficial da Celesc — abrem em uma nova aba para você consultar falta de energia, dúvidas, normas e mais.
          </p>
        </div>
        <div class="link-button-grid">
          <a
            class="link-tile"
            href="https://conecte.celesc.com.br/contrato/informar-falta-de-energia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="link-tile-label">Informar falta de energia</span>
            <span class="link-tile-arrow" aria-hidden="true">↗</span>
          </a>
          <a
            class="link-tile"
            href="https://conecte.celesc.com.br/contrato/duvidas-frequentes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="link-tile-label">Dúvidas frequentes</span>
            <span class="link-tile-arrow" aria-hidden="true">↗</span>
          </a>
          <a
            class="link-tile"
            href="https://conecte.celesc.com.br/contrato/fale-conosco"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="link-tile-label">Fale conosco</span>
            <span class="link-tile-arrow" aria-hidden="true">↗</span>
          </a>
          <a
            class="link-tile"
            href="https://conecte.celesc.com.br/portal-tecnico/links-normas-tecnicas"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="link-tile-label">Normas técnicas</span>
            <span class="link-tile-arrow" aria-hidden="true">↗</span>
          </a>
          <a
            class="link-tile link-tile-highlight"
            href="https://celgeoweb.celesc.com.br/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="link-tile-label">Situação em tempo real do fornecimento</span>
            <span class="link-tile-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>Aplicativo local de demonstração — para faturas detalhadas e pagamentos, use sempre os canais oficiais da Celesc.</p>
    </footer>

    <div id="requestDetailModal" class="modal-root hidden" hidden>
      <div class="modal-backdrop" data-modal-dismiss tabindex="-1" aria-hidden="true"></div>
      <div
        class="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requestDetailTitle"
      >
        <header class="modal-head">
          <h2 id="requestDetailTitle" class="modal-title">Detalhes da solicitação</h2>
          <button type="button" class="btn quiet modal-close-btn" id="requestDetailClose" aria-label="Fechar">
            Fechar
          </button>
        </header>
        <div id="requestDetailBody" class="modal-body"></div>
      </div>
    </div>
  </div>
`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { error: text };
    }
  }
  const obj = body as { error?: string } | null;
  return {
    ok: res.ok,
    status: res.status,
    data: res.ok ? (body as T) : undefined,
    error: res.ok ? undefined : obj?.error ?? res.statusText,
  };
}

function setFeedback(el: HTMLElement, text: string, kind?: "ok" | "err") {
  el.textContent = text;
  el.classList.remove("ok", "err");
  if (kind === "ok") el.classList.add("ok");
  if (kind === "err") el.classList.add("err");
}

/** Browser-only persistence; avoid on shared computers (XSS can read localStorage). */
const LS = {
  REMEMBER: "celesc.remember",
  EMAIL: "celesc.email",
  PASSWORD: "celesc.password",
  COOKIE: "celesc.loginCookie",
  /** Cached instalações + solicitações, scoped to `username` inside the JSON. */
  DASHBOARD_CACHE: "celesc.dashboard.v1",
} as const;

type PersistedDashboardV1 = {
  v: 1;
  username: string;
  installations: ContractsPayload;
  trackings: {
    rows: RequestTrackingRow[];
    lastTrackingApiMessage?: string;
  };
};

function normalizeUserKey(u: string): string {
  return u.trim().toLowerCase();
}

/** Set on login and on `/api/session` when authenticated; used for cache key + writes. */
let currentDashboardUser: string | null = null;
/** Original e-mail string for UI (header); `currentDashboardUser` stays normalized for cache. */
let sessionDisplayEmail: string | null = null;
/** Titular / nome preferencial; filled from contratos when disponível. */
let sessionDisplayName: string | null = null;

function friendlyNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return email;
  return local
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function titularNameFromContracts(data: ContractsPayload): string | null {
  const list = data.allContracts?.contracts ?? [];
  for (const c of list) {
    const n = str(c.name).trim();
    if (n) return n;
    const d = str(c.denomination).trim();
    if (d) return d;
  }
  return null;
}

function syncHeaderUser(): void {
  const wrap = app.querySelector<HTMLElement>("#headerUser");
  const nameEl = app.querySelector<HTMLElement>("#headerUserName");
  const emailEl = app.querySelector<HTMLElement>("#headerUserEmail");
  if (!wrap || !nameEl || !emailEl) return;
  const email = sessionDisplayEmail?.trim() ?? "";
  if (!email) {
    nameEl.textContent = "";
    emailEl.textContent = "";
    return;
  }
  const name =
    sessionDisplayName?.trim() || friendlyNameFromEmail(email);
  nameEl.textContent = name;
  emailEl.textContent = email;
}

function readPersistedDashboard(forUser: string): PersistedDashboardV1 | null {
  const key = normalizeUserKey(forUser);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(LS.DASHBOARD_CACHE);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<PersistedDashboardV1>;
    if (o.v !== 1 || typeof o.username !== "string") return null;
    if (normalizeUserKey(o.username) !== key) return null;
    if (!o.installations || typeof o.installations !== "object") return null;
    if (!o.trackings || !Array.isArray(o.trackings.rows)) return null;
    return o as PersistedDashboardV1;
  } catch {
    return null;
  }
}

function writePersistedDashboard(data: PersistedDashboardV1): void {
  try {
    localStorage.setItem(LS.DASHBOARD_CACHE, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

function clearPersistedDashboard(): void {
  localStorage.removeItem(LS.DASHBOARD_CACHE);
}

/** Show cached dashboard for this account before the network refresh runs. */
function hydrateFromPersisted(username: string): void {
  const p = readPersistedDashboard(username);
  if (!p) return;
  if (p.installations.allContracts) {
    outInstallations.innerHTML = renderInstallations(p.installations);
  }
  if (p.trackings.rows.length) {
    clearTrackingStore();
    for (const r of p.trackings.rows) {
      trackingByProtocol.set(uniqueTrackingKey(r), { ...r });
    }
    lastTrackingFetchError = null;
    renderTrackingsPanel({ refreshing: true });
  }
}

function clearStoredCredentials(): void {
  localStorage.removeItem(LS.REMEMBER);
  localStorage.removeItem(LS.EMAIL);
  localStorage.removeItem(LS.PASSWORD);
  localStorage.removeItem(LS.COOKIE);
  clearPersistedDashboard();
}

function restoreFormFromStorage(): void {
  const remember = app.querySelector<HTMLInputElement>("#rememberMe")!;
  if (localStorage.getItem(LS.REMEMBER) !== "1") {
    remember.checked = false;
    return;
  }
  remember.checked = true;
  const email = localStorage.getItem(LS.EMAIL);
  const password = localStorage.getItem(LS.PASSWORD);
  const cookie = localStorage.getItem(LS.COOKIE);
  if (email !== null) {
    app.querySelector<HTMLInputElement>("#username")!.value = email;
  }
  if (password !== null) {
    app.querySelector<HTMLInputElement>("#password")!.value = password;
  }
  if (cookie !== null) {
    app.querySelector<HTMLTextAreaElement>("#loginCookie")!.value = cookie;
  }
}

function persistCredentialsIfRequested(): void {
  const remember = app.querySelector<HTMLInputElement>("#rememberMe")!.checked;
  const username = app.querySelector<HTMLInputElement>("#username")!.value.trim();
  const password = app.querySelector<HTMLInputElement>("#password")!.value;
  const loginCookie = app.querySelector<HTMLTextAreaElement>("#loginCookie")!.value.trim();
  if (remember) {
    localStorage.setItem(LS.REMEMBER, "1");
    localStorage.setItem(LS.EMAIL, username);
    localStorage.setItem(LS.PASSWORD, password);
    localStorage.setItem(LS.COOKIE, loginCookie);
  } else {
    clearStoredCredentials();
  }
}

const MONTH_YEAR_FMT = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

/** List UI: show opening / forecast dates as dd/MM/yyyy. */
function formatRequestListDate(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "—";
  const dot = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (dot) {
    return `${dot[1].padStart(2, "0")}/${dot[2].padStart(2, "0")}/${dot[3]}`;
  }
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slash) {
    return `${slash[1].padStart(2, "0")}/${slash[2].padStart(2, "0")}/${slash[3]}`;
  }
  const ms = Date.parse(trimmed);
  if (!Number.isNaN(ms)) {
    const dt = new Date(ms);
    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = String(dt.getFullYear());
    return `${d}/${m}/${y}`;
  }
  return trimmed;
}

/** API uses DD.MM.YYYY; falls back to Date.parse for other strings. */
function parseTrackingDate(createdDate: string): {
  key: string;
  time: number;
  label: string;
} | null {
  const trimmed = createdDate.trim();
  const dot = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (dot) {
    const day = Number(dot[1]);
    const month = Number(dot[2]) - 1;
    const year = Number(dot[3]);
    const dt = new Date(year, month, day);
    if (Number.isNaN(dt.getTime())) return null;
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    const raw = MONTH_YEAR_FMT.format(dt);
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return { key, time: dt.getTime(), label };
  }
  const ms = Date.parse(trimmed);
  if (!Number.isNaN(ms)) {
    const dt = new Date(ms);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const raw = MONTH_YEAR_FMT.format(dt);
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return { key, time: ms, label };
  }
  return null;
}

function groupRequestsByMonth(rows: RequestTrackingRow[]): Array<{
  key: string;
  label: string;
  sortTime: number;
  items: RequestTrackingRow[];
}> {
  const map = new Map<
    string,
    { label: string; sortTime: number; items: RequestTrackingRow[] }
  >();

  for (const r of rows) {
    const p = parseTrackingDate(r.createdDate ?? "");
    const key = p?.key ?? "__sem_data";
    const label = p?.label ?? "Sem data de abertura";
    const sortTime = p?.time ?? 0;
    let g = map.get(key);
    if (!g) {
      g = { label, sortTime, items: [] };
      map.set(key, g);
    }
    g.items.push(r);
  }

  for (const g of map.values()) {
    g.items.sort((a, b) => {
      const ta = parseTrackingDate(a.createdDate ?? "")?.time ?? 0;
      const tb = parseTrackingDate(b.createdDate ?? "")?.time ?? 0;
      return tb - ta;
    });
  }

  const groups = [...map.entries()].map(([key, v]) => ({ key, ...v }));
  groups.sort((a, b) => {
    if (a.key === "__sem_data") return 1;
    if (b.key === "__sem_data") return -1;
    return b.sortTime - a.sortTime;
  });
  return groups;
}

/** Dedup key: protocolo when present; fallback rarely needed. */
function uniqueTrackingKey(r: RequestTrackingRow): string {
  const proto = String(r.protocol ?? "").trim();
  if (proto) return proto;
  return `sem-protocolo:${r.createdDate ?? ""}:${r.nameProtocol ?? ""}:${r.finishedDate ?? ""}:${r.status ?? ""}`;
}

const trackingByProtocol = new Map<string, RequestTrackingRow>();
let lastTrackingFetchError: string | null = null;
let selectedTrackingPeriodKey: string | null = null;
let requestDetailOpen = false;

/** Cached CMS shell data; refetched only after logout (one GraphQL round trip vs four). */
let cmsLayoutCache: CmsLayoutPayload | null = null;

function clearTrackingStore(): void {
  trackingByProtocol.clear();
  lastTrackingFetchError = null;
  selectedTrackingPeriodKey = null;
}

function clearCmsLayoutCache(): void {
  cmsLayoutCache = null;
}

function layoutMaintenanceActive(data: CmsLayoutPayload | null): boolean {
  const list = data?.schedulingConfigs ?? [];
  return list.some((c) => Boolean(c?.isMaintenanceMode));
}

function updateMaintenanceBanner(data: CmsLayoutPayload | null): void {
  const el = app.querySelector<HTMLElement>("#maintenanceBanner");
  if (!el) return;
  if (layoutMaintenanceActive(data)) {
    el.textContent =
      "O sistema pode estar em manutenção programada. Se algo falhar, tente de novo mais tarde.";
    el.classList.remove("hidden");
    el.hidden = false;
  } else {
    el.textContent = "";
    el.classList.add("hidden");
    el.hidden = true;
  }
}

function listTrackingsFromStore(): RequestTrackingRow[] {
  return Array.from(trackingByProtocol.values()).sort((a, b) => {
    const ta = parseTrackingDate(a.createdDate ?? "")?.time ?? 0;
    const tb = parseTrackingDate(b.createdDate ?? "")?.time ?? 0;
    return tb - ta;
  });
}

function mergeTrackingsFromResponse(data: RequestTrackingsPayload): boolean {
  const block = data.getAllRequestTrackings;
  if (!block) return false;
  for (const r of block.requestTrackings ?? []) {
    trackingByProtocol.set(uniqueTrackingKey(r), { ...r });
  }
  return true;
}

function syncSelectedPeriodToGroups(
  groups: Array<{ key: string }>,
): void {
  if (
    selectedTrackingPeriodKey &&
    groups.some((g) => g.key === selectedTrackingPeriodKey)
  ) {
    return;
  }
  selectedTrackingPeriodKey = groups[0]?.key ?? null;
}

function requestItemHtml(r: RequestTrackingRow): string {
  const fmt = esc(r.formatting ?? "neutral");
  const proto = String(r.protocol ?? "").trim();
  const openHint = proto
    ? ` aria-label="Ver detalhes do protocolo ${esc(proto)}"`
    : "";
  const openD = esc(formatRequestListDate(r.createdDate));
  const dueD = esc(formatRequestListDate(r.finishedDate));
  return `
        <li>
          <button type="button" class="request-item request-item-open"${proto ? ` data-protocol="${esc(proto)}"` : ""}${openHint}>
          <div class="request-main">
            <span class="request-service">${esc(r.nameProtocol ?? "Serviço")}</span>
            <span class="request-protocol">Protocolo ${esc(r.protocol ?? "—")}</span>
          </div>
          <p class="request-desc">${esc(r.description ?? "")}</p>
          <div class="request-meta">
            <span class="request-dates">Abertura <strong class="request-date-value">${openD}</strong> · Previsão <strong class="request-date-value">${dueD}</strong></span>
            <span class="status-pill fmt-${fmt}">${esc(r.status ?? "")}</span>
          </div>
          ${proto ? `<span class="request-open-hint">Toque para ver o andamento</span>` : ""}
          </button>
        </li>`;
}

/** GraphQL often returns a generic success `message`; omit when the UI already shows the payload. */
function redundantGraphqlSuccessMessage(msg: string): boolean {
  const t = msg.trim();
  if (!t) return true;
  if (/\bsem\s+sucesso\b/i.test(t)) return false;
  if (!/\bsucesso\b/i.test(t)) return false;
  const l = t.toLowerCase();
  return (
    l.includes("recuperad") ||
    l.includes("solicita") ||
    l.includes("retornad") ||
    l.includes("consultad") ||
    l.includes("carregad")
  );
}

function sortTrackingSteps(steps: TrackingStatusStep[]): TrackingStatusStep[] {
  return [...steps].sort((a, b) => {
    const na = Number.parseInt(String(a.sequencial ?? "0"), 10);
    const nb = Number.parseInt(String(b.sequencial ?? "0"), 10);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
    return String(a.sequencial ?? "").localeCompare(
      String(b.sequencial ?? ""),
      undefined,
      { numeric: true },
    );
  });
}

function renderRequestDetailContentHtml(
  protocol: string,
  data: RequestTrackingStatusPayload | null,
  error?: string,
): string {
  if (error) {
    return `<p class="error-inline">${esc(error)}</p><p class="modal-foot-note">Protocolo ${esc(protocol)}</p>`;
  }
  const block = data?.getRequestTrackingStatus;
  if (!block) {
    return `<p class="empty-state">Resposta vazia do servidor.</p>`;
  }
  const apiErr = block.error === true || block.error === "true";
  const entries = block.requestTrackingStatus ?? [];
  const msg = String(block.message ?? "");
  if (apiErr) {
    return `<p class="error-inline">${esc(msg || "Não foi possível carregar os detalhes.")}</p>`;
  }
  const entry = entries[0];
  if (!entry) {
    const note =
      msg && !redundantGraphqlSuccessMessage(msg)
        ? msg
        : "Nenhum detalhe retornado para este protocolo.";
    return `<p class="empty-state">${esc(note)}</p>`;
  }

  const rows: Array<{ label: string; value: string }> = [
    { label: "Protocolo", value: str(entry.protocol || protocol) },
    { label: "Canal", value: str(entry.channel) },
    { label: "Nome do protocolo", value: str(entry.nameProtocol) },
    { label: "Parceiro", value: str(entry.namePartner) },
    { label: "E-mail", value: str(entry.email) },
    { label: "Telefone", value: str(entry.telephone) },
    { label: "Celular", value: str(entry.cellphone) },
    { label: "CPF/CNPJ", value: str(entry.taxnum) },
    { label: "Endereço", value: str(entry.address) },
    { label: "Tipo", value: str(entry.type) },
    { label: "Código do resultado", value: str(entry.resultCode) },
    { label: "Mensagem do sistema", value: str(entry.resultMessage) },
  ].filter((r) => r.value);

  const defs = rows
    .map(
      (r) =>
        `<div class="detail-dl-row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`,
    )
    .join("");

  const steps = sortTrackingSteps(entry.tabStatus ?? []);
  const timeline =
    steps.length === 0
      ? `<p class="empty-state inner">Nenhuma etapa de andamento informada.</p>`
      : `<ol class="tracking-timeline">
          ${steps
            .map((s) => {
              const fmt = esc(s.formatting ?? "neutral");
              const svc = str(s.nameService) || "Etapa";
              return `<li class="tracking-timeline-item">
                <div class="tracking-timeline-top">
                  <span class="tracking-timeline-service">${esc(svc)}</span>
                  <span class="status-pill fmt-${fmt}">${esc(str(s.statusStep))}</span>
                </div>
                <p class="tracking-timeline-desc">${esc(str(s.descriptionStep))}</p>
                <p class="tracking-timeline-meta">${esc(str(s.statusDatetime))}${s.sequencial ? ` · seq. ${esc(String(s.sequencial))}` : ""}${s.serviceCode ? ` · ${esc(String(s.serviceCode))}` : ""}</p>
                ${str(s.messageStep) ? `<p class="tracking-timeline-msg">${esc(str(s.messageStep))}</p>` : ""}
              </li>`;
            })
            .join("")}
        </ol>`;

  return `
    ${msg && !redundantGraphqlSuccessMessage(msg) ? `<p class="info-banner subtle">${esc(msg)}</p>` : ""}
    <dl class="detail-dl">${defs}</dl>
    <h3 class="modal-section-title">Andamento</h3>
    ${timeline}`;
}

async function openRequestDetailModal(protocol: string): Promise<void> {
  const modal = app.querySelector<HTMLElement>("#requestDetailModal");
  const body = app.querySelector<HTMLElement>("#requestDetailBody");
  const title = app.querySelector<HTMLElement>("#requestDetailTitle");
  if (!modal || !body || !title) return;

  title.textContent = `Protocolo ${protocol}`;
  body.innerHTML = `<p class="skeleton modal-skeleton">Carregando detalhes…</p>`;
  modal.classList.remove("hidden");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  requestDetailOpen = true;

  const res = await api<RequestTrackingStatusPayload>(
    `/api/request-tracking-status?${new URLSearchParams({ protocol })}`,
  );
  if (!res.ok) {
    body.innerHTML = renderRequestDetailContentHtml(protocol, null, res.error);
    return;
  }
  body.innerHTML = renderRequestDetailContentHtml(protocol, res.data ?? null);
}

function closeRequestDetailModal(): void {
  const modal = app.querySelector<HTMLElement>("#requestDetailModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  requestDetailOpen = false;
}

function formatAddress(c: Record<string, unknown>): string {
  const line1 = [str(c.street), str(c.houseNum)].filter(Boolean).join(", ");
  const line2 = [str(c.city1), str(c.region), str(c.postCode)]
    .filter(Boolean)
    .join(" · ");
  const extra = str(c.complement) || str(c.referencePoint);
  const parts = [line1, line2, extra].filter(Boolean);
  return parts.join(" · ") || "Endereço não informado.";
}

function renderInstallations(data: ContractsPayload): string {
  const ac = data.allContracts;
  if (!ac) {
    return `<p class="empty-state">Não foi possível ler os dados da conta. Tente atualizar ou entre novamente.</p>`;
  }
  const list = ac.contracts ?? [];
  const note = str(ac.message);
  if (!list.length) {
    return `
      <div class="empty-card">
        <p class="empty-state">Nenhuma instalação encontrada para esta conta.</p>
        ${note ? `<p class="empty-note">${esc(note)}</p>` : ""}
      </div>`;
  }

  return `
    ${note ? `<p class="info-banner">${esc(note)}</p>` : ""}
    <div class="installation-grid">
      ${list
        .map((c) => {
          const alert = str(c.alert);
          const denom = str(c.denomination) || str(c.name) || "Unidade consumidora";
          return `
        <article class="installation-card">
          <div class="installation-card-top">
            <h3>${esc(denom)}</h3>
            ${alert ? `<p class="installation-alert">${esc(alert)}</p>` : ""}
          </div>
          <p class="installation-address">${esc(formatAddress(c))}</p>
          <dl class="installation-facts">
            <div><dt>Instalação</dt><dd>${esc(str(c.installation) || "—")}</dd></div>
            <div><dt>Contrato</dt><dd>${esc(str(c.contract) || "—")}</dd></div>
            <div><dt>Conta contrato</dt><dd>${esc(str(c.contractAccount) || "—")}</dd></div>
            <div><dt>Tarifa</dt><dd>${esc(str(c.tarifType) || "—")}</dd></div>
            <div><dt>Situação</dt><dd>${esc(str(c.status) || "—")}</dd></div>
          </dl>
        </article>`;
        })
        .join("")}
    </div>`;
}

function renderTrackingsPanel(options: { refreshing?: boolean } = {}): void {
  const { refreshing = false } = options;
  const rows = listTrackingsFromStore();
  const groups = groupRequestsByMonth(rows);
  syncSelectedPeriodToGroups(groups);

  const fetchErr = lastTrackingFetchError;

  if (!rows.length && !fetchErr) {
    outRequests.innerHTML = `
      <div class="empty-card">
        <p class="empty-state">Você não tem solicitações em andamento neste momento.</p>
      </div>`;
    return;
  }

  if (!rows.length && fetchErr) {
    outRequests.innerHTML = `<p class="error-inline">${esc(fetchErr)}</p>`;
    return;
  }

  const activeGroup = groups.find((g) => g.key === selectedTrackingPeriodKey);
  const listItems = activeGroup?.items ?? [];

  const tabsHtml = groups
    .map((g) => {
      const sel = g.key === selectedTrackingPeriodKey;
      return `<button type="button" class="request-period-tab" role="tab" aria-selected="${sel ? "true" : "false"}" data-period-key="${esc(g.key)}" title="${esc(g.label)}">${esc(g.label)}</button>`;
    })
    .join("");

  outRequests.innerHTML = `
    <div class="requests-widget">
      ${fetchErr ? `<p class="info-banner subtle">${esc(fetchErr)} · exibindo dados já carregados</p>` : ""}
      <div class="request-top-bar" role="tablist" aria-label="Filtrar por mês de abertura">
        <div class="request-top-bar-inner">
          ${tabsHtml}
        </div>
        ${refreshing ? `<span class="request-refresh-hint" aria-live="polite">Atualizando…</span>` : ""}
      </div>
      <div class="request-scroll" role="tabpanel" aria-label="Solicitações do período" tabindex="0">
        ${
          listItems.length
            ? `<ul class="request-list request-list-compact">${listItems.map((r) => requestItemHtml(r)).join("")}</ul>`
            : `<p class="empty-state inner">Nenhuma solicitação neste período.</p>`
        }
      </div>
    </div>`;
}

const loginStatus = app.querySelector<HTMLElement>("#loginStatus")!;
const dataArea = app.querySelector<HTMLElement>("#dataArea")!;
const loginSection = app.querySelector<HTMLElement>("#loginSection")!;
const loginFormPanel = app.querySelector<HTMLElement>("#loginFormPanel")!;
const appShell = app.querySelector<HTMLElement>(".app")!;
const outInstallations = app.querySelector<HTMLElement>("#outInstallations")!;
const outRequests = app.querySelector<HTMLElement>("#outRequests")!;

outRequests.addEventListener("click", (e) => {
  const openBtn = (e.target as HTMLElement).closest("[data-protocol]");
  if (openBtn instanceof HTMLButtonElement) {
    const p = openBtn.dataset.protocol?.trim();
    if (p) void openRequestDetailModal(p);
    return;
  }
  const btn = (e.target as HTMLElement).closest("[data-period-key]");
  if (!btn || !(btn instanceof HTMLButtonElement)) return;
  const key = btn.dataset.periodKey;
  if (key === undefined) return;
  selectedTrackingPeriodKey = key;
  renderTrackingsPanel();
});

app.querySelector("#requestDetailClose")?.addEventListener("click", () => {
  closeRequestDetailModal();
});

app
  .querySelector("#requestDetailModal [data-modal-dismiss]")
  ?.addEventListener("click", () => {
    closeRequestDetailModal();
  });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && requestDetailOpen) {
    e.preventDefault();
    closeRequestDetailModal();
  }
});

function showDataShell(authenticated: boolean) {
  const headerUser = app.querySelector<HTMLElement>("#headerUser");
  if (authenticated) {
    appShell.classList.add("app--authenticated");
    dataArea.classList.remove("hidden");
    loginSection.classList.add("hidden");
    loginSection.hidden = true;
    headerUser?.classList.remove("hidden");
    if (headerUser) headerUser.hidden = false;
    syncHeaderUser();
  } else {
    currentDashboardUser = null;
    sessionDisplayEmail = null;
    sessionDisplayName = null;
    syncHeaderUser();
    appShell.classList.remove("app--authenticated");
    dataArea.classList.add("hidden");
    loginSection.classList.remove("hidden");
    loginSection.hidden = false;
    loginFormPanel.classList.remove("hidden");
    loginFormPanel.hidden = false;
    headerUser?.classList.add("hidden");
    if (headerUser) headerUser.hidden = true;
    clearTrackingStore();
    clearCmsLayoutCache();
    updateMaintenanceBanner(null);
    outInstallations.innerHTML = `<p class="skeleton">Carregando…</p>`;
    outRequests.innerHTML = `<p class="skeleton">Carregando…</p>`;
  }
}

async function loadOverview(): Promise<void> {
  const hadInstallationGrid = Boolean(
    outInstallations.querySelector(".installation-grid"),
  );
  const hadRequestsWidget = Boolean(
    outRequests.querySelector(".requests-widget"),
  );

  if (!hadInstallationGrid) {
    outInstallations.innerHTML = `<p class="skeleton">Carregando instalações…</p>`;
  } else {
    const hint = document.createElement("p");
    hint.className = "info-banner subtle";
    hint.setAttribute("aria-live", "polite");
    hint.textContent = "Atualizando instalações…";
    outInstallations.prepend(hint);
  }

  lastTrackingFetchError = null;
  if (!hadRequestsWidget) {
    outRequests.innerHTML = `<p class="skeleton">Carregando solicitações…</p>`;
  } else {
    renderTrackingsPanel({ refreshing: true });
  }

  const layoutPromise =
    cmsLayoutCache !== null
      ? Promise.resolve({
          ok: true as const,
          status: 200,
          data: cmsLayoutCache,
        })
      : api<CmsLayoutPayload>("/api/cms/layout");

  const [contractsRes, trackRes, layoutRes] = await Promise.all([
    api<ContractsPayload>("/api/contracts"),
    api<RequestTrackingsPayload>("/api/request-trackings"),
    layoutPromise,
  ]);

  if (layoutRes.ok && layoutRes.data) {
    cmsLayoutCache = layoutRes.data;
    updateMaintenanceBanner(cmsLayoutCache);
  }

  if (!contractsRes.ok) {
    outInstallations.innerHTML = `<p class="error-inline">${esc(contractsRes.error ?? "Erro ao carregar instalações.")}</p>`;
  } else {
    const cdata = contractsRes.data!;
    sessionDisplayName = titularNameFromContracts(cdata);
    syncHeaderUser();
    outInstallations.innerHTML = renderInstallations(cdata);
  }

  if (!trackRes.ok) {
    lastTrackingFetchError =
      trackRes.error ?? "Erro ao carregar solicitações.";
    renderTrackingsPanel();
  } else {
    mergeTrackingsFromResponse(trackRes.data!);
    renderTrackingsPanel();
  }

  if (currentDashboardUser) {
    const prev = readPersistedDashboard(currentDashboardUser);
    const installations: ContractsPayload =
      contractsRes.ok && contractsRes.data
        ? contractsRes.data
        : (prev?.installations ?? { allContracts: { contracts: [] } });
    const rows = listTrackingsFromStore();
    writePersistedDashboard({
      v: 1,
      username: currentDashboardUser,
      installations,
      trackings: { rows },
    });
  }
}

async function performLogin(options: { auto?: boolean } = {}): Promise<boolean> {
  const { auto = false } = options;
  const username = app.querySelector<HTMLInputElement>("#username")!.value;
  const password = app.querySelector<HTMLInputElement>("#password")!.value;
  const loginCookie = app.querySelector<HTMLTextAreaElement>("#loginCookie")!.value;
  setFeedback(
    loginStatus,
    auto ? "Entrando com dados salvos…" : "Entrando…",
  );
  const r = await api<{ ok?: boolean }>("/api/login", {
    method: "POST",
    body: JSON.stringify({
      username: username.trim(),
      password,
      loginCookie: loginCookie.trim() || undefined,
    }),
  });
  if (r.ok) {
    persistCredentialsIfRequested();
    setFeedback(loginStatus, "Bem-vindo de volta.", "ok");
    sessionDisplayEmail = username.trim();
    sessionDisplayName = null;
    currentDashboardUser = normalizeUserKey(username);
    showDataShell(true);
    hydrateFromPersisted(currentDashboardUser);
    await loadOverview();
    return true;
  }
  setFeedback(
    loginStatus,
    r.error ?? "Não foi possível entrar. Verifique e-mail e senha.",
    "err",
  );
  return false;
}

app.querySelector("#btnLogin")!.addEventListener("click", () => {
  void performLogin();
});

app.querySelector("#btnForgetSaved")!.addEventListener("click", () => {
  clearStoredCredentials();
  app.querySelector<HTMLInputElement>("#rememberMe")!.checked = false;
  setFeedback(loginStatus, "Dados salvos foram apagados neste navegador.");
});

app.querySelector("#btnLogout")!.addEventListener("click", async () => {
  await api("/api/logout", { method: "POST", body: "{}" });
  setFeedback(loginStatus, "Você saiu da sessão.");
  showDataShell(false);
  restoreFormFromStorage();
});

app.querySelector("#btnRefresh")!.addEventListener("click", () => {
  void loadOverview();
});

void (async () => {
  restoreFormFromStorage();
  const s = await api<{ authenticated?: boolean; username?: string }>(
    "/api/session",
  );
  if (s.ok && s.data?.authenticated) {
    setFeedback(loginStatus, "Sessão ativa.", "ok");
    const u = s.data.username?.trim();
    sessionDisplayEmail = u ?? null;
    sessionDisplayName = null;
    currentDashboardUser = u ? normalizeUserKey(u) : null;
    showDataShell(true);
    if (currentDashboardUser) hydrateFromPersisted(currentDashboardUser);
    await loadOverview();
    return;
  }
  const saved =
    localStorage.getItem(LS.REMEMBER) === "1" &&
    Boolean(localStorage.getItem(LS.EMAIL)) &&
    Boolean(localStorage.getItem(LS.PASSWORD));
  if (saved) {
    const ok = await performLogin({ auto: true });
    if (!ok) {
      showDataShell(false);
    }
  }
})();
