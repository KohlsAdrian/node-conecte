export type CelescConfig = {
  baseUrl: string;
  channel: string;
  defaultDeviceId: string;
  /** Value for `Cookie` on `/auth/login` (e.g. `TS01748a9b=...` from DevTools) */
  loginCookieHeader?: string;
  /** Overrides default Referer `{baseUrl}/autenticacao/login` */
  loginReferer?: string;
  /** `POST /auth/logout` Referer (HAR: logged-in area e.g. `/contrato/selecao`) */
  logoutReferer?: string;
  loginUserAgent: string;
};

/** Browser-like UA; some WAFs behave differently without it. */
export const CELESC_DEFAULT_LOGIN_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

export function loadCelescConfig(): CelescConfig {
  const baseUrl =
    process.env.CELESC_BASE_URL?.replace(/\/$/, "") ??
    "https://conecte.celesc.com.br";

  const loginCookieHeader = process.env.CELESC_LOGIN_COOKIE?.trim();
  const loginReferer = process.env.CELESC_LOGIN_REFERER?.trim();
  const logoutReferer = process.env.CELESC_LOGOUT_REFERER?.trim();
  const loginUserAgent =
    process.env.CELESC_USER_AGENT?.trim() || CELESC_DEFAULT_LOGIN_USER_AGENT;

  return {
    baseUrl,
    channel: process.env.CELESC_CHANNEL ?? "ZAW",
    defaultDeviceId: process.env.CELESC_DEVICE_ID ?? "Node Celesc App",
    ...(loginCookieHeader ? { loginCookieHeader } : {}),
    ...(loginReferer ? { loginReferer } : {}),
    ...(logoutReferer ? { logoutReferer } : {}),
    loginUserAgent,
  };
}

export function defaultLoginReferer(config: CelescConfig): string {
  return new URL("/autenticacao/login", config.baseUrl).href;
}

export function defaultLogoutReferer(config: CelescConfig): string {
  return new URL("/contrato/selecao", config.baseUrl).href;
}
