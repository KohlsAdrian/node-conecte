import type { CelescSession } from "../../domain/session.types.js";

/**
 * Persistence boundary for auth/session. Swap implementations (memory, Redis, secure file) without changing services.
 */
export abstract class SessionStore {
  abstract getSession(): CelescSession | null;
  abstract setSession(session: CelescSession): void;
  abstract clear(): void;

  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  isAuthenticated(): boolean {
    const t = this.getAccessToken();
    return typeof t === "string" && t.length > 0;
  }
}
