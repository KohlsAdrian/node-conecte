import type { CelescLoginResponseBody } from "../domain/auth-login.types.js";

/** Strip accidental `Bearer ` when copying from DevTools. */
export function normalizeAccessTokenFromEnv(raw: string): string {
  let t = raw.trim();
  if (/^bearer\s+/i.test(t)) {
    t = t.replace(/^bearer\s+/i, "").trim();
  }
  return t;
}

/** HAR path: `data.authenticate.login.accessToken` */
export function pickCelescAuthLoginAccessToken(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const data = (payload as CelescLoginResponseBody).data;
  if (typeof data !== "object" || data === null) return null;
  const authenticate = data.authenticate;
  if (typeof authenticate !== "object" || authenticate === null) return null;
  const login = authenticate.login;
  if (typeof login !== "object" || login === null) return null;
  const accessToken = login.accessToken;
  return typeof accessToken === "string" && accessToken.trim().length > 0
    ? accessToken.trim()
    : null;
}

export type ParsedCelescLogin = {
  accessToken: string;
  userId?: string;
  partner?: string;
  accessId?: string;
};

export function parseCelescLoginSuccess(payload: unknown): ParsedCelescLogin | null {
  const accessToken = pickCelescAuthLoginAccessToken(payload);
  if (!accessToken) return null;

  if (typeof payload !== "object" || payload === null) {
    return { accessToken };
  }
  const data = (payload as CelescLoginResponseBody).data;
  const authenticate = data?.authenticate;
  if (typeof authenticate !== "object" || authenticate === null) {
    return { accessToken };
  }

  const profileSub =
    typeof authenticate.profile?.sub === "string"
      ? authenticate.profile.sub.trim()
      : undefined;
  const sapUserId =
    typeof authenticate.sapAccess?.userId === "string"
      ? authenticate.sapAccess.userId.trim()
      : undefined;
  const partner =
    typeof authenticate.sapAccess?.partner === "string"
      ? authenticate.sapAccess.partner.trim()
      : undefined;
  const accessId =
    typeof authenticate.sapAccess?.accessId === "string"
      ? authenticate.sapAccess.accessId.trim()
      : undefined;

  const userId = profileSub || sapUserId || undefined;

  return {
    accessToken,
    ...(userId ? { userId } : {}),
    ...(partner !== undefined && partner !== "" ? { partner } : {}),
    ...(accessId !== undefined && accessId !== "" ? { accessId } : {}),
  };
}

const DIRECT_TOKEN_KEYS = [
  "accessToken",
  "token",
  "access_token",
  "bearerToken",
  "bearer",
  "jwt",
  "authToken",
  "id_token",
  "idToken",
] as const;

const NEST_OBJECT_KEYS = [
  "data",
  "authenticate",
  "login",
  "result",
  "session",
  "auth",
  "authentication",
  "user",
  "credentials",
] as const;

export function pickAccessToken(payload: unknown): string | null {
  const celesc = pickCelescAuthLoginAccessToken(payload);
  if (celesc) return celesc;
  return pickAccessTokenDeep(payload);
}

/** API message when `login.accessToken` is missing (helps debug WAF / expired code). */
export function describeCelescLoginFailure(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const data = (payload as Record<string, unknown>).data;
  if (typeof data !== "object" || data === null) return null;
  const auth = (data as Record<string, unknown>).authenticate;
  if (typeof auth !== "object" || auth === null) return null;
  const msg = (auth as Record<string, unknown>).message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  const err = (auth as Record<string, unknown>).error;
  if (typeof err === "string" && err.trim()) return err.trim();
  return null;
}

function pickAccessTokenDeep(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const obj = payload as Record<string, unknown>;
  for (const k of DIRECT_TOKEN_KEYS) {
    const v = obj[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  for (const k of NEST_OBJECT_KEYS) {
    if (obj[k] !== undefined) {
      const inner = pickAccessTokenDeep(obj[k]);
      if (inner) return inner;
    }
  }
  return null;
}
