import type { CelescConfig } from "../config/celesc.config.js";
import { defaultLoginReferer } from "../config/celesc.config.js";
import type { AuthRepository } from "../repositories/auth.repository.js";
import {
  describeCelescLoginFailure,
  normalizeAccessTokenFromEnv,
  parseCelescLoginSuccess,
} from "../services/login-token.util.js";
import type { AuthStrategy } from "../strategies/auth/auth-strategy.abstract.js";
import type { AuthStrategyContext } from "../strategies/auth/auth-strategy.abstract.js";
import { SessionStore } from "./abstract/session-store.abstract.js";
import { SessionManager } from "./abstract/session-manager.abstract.js";

export class CelescSessionManager extends SessionManager {
  constructor(
    private readonly config: CelescConfig,
    private readonly sessionStore: SessionStore,
    private readonly authRepository: AuthRepository,
  ) {
    super();
  }

  async signIn(
    strategy: AuthStrategy,
    ctx: Omit<AuthStrategyContext, "config">,
  ): Promise<void> {
    const full: AuthStrategyContext = { ...ctx, config: this.config };
    const body = strategy.buildLoginRequest(full);
    const referer =
      this.config.loginReferer ?? defaultLoginReferer(this.config);
    const res = await this.authRepository.login(body, { referer });
    const parsed = parseCelescLoginSuccess(res);
    if (!parsed) {
      const apiMsg = describeCelescLoginFailure(res);
      const hint =
        "Set `CELESC_USERNAME`, `CELESC_PASSWORD`, `CELESC_LOGIN_COOKIE` (from DevTools → `/auth/login` request), or `CELESC_ACCESS_TOKEN`.";
      throw new Error(
        apiMsg
          ? `Login failed: ${apiMsg}. ${hint}`
          : `Login HTTP OK but no accessToken in response. ${hint}`,
      );
    }
    this.sessionStore.setSession({
      accessToken: parsed.accessToken,
      updatedAt: new Date().toISOString(),
      ...(parsed.userId ? { userId: parsed.userId } : {}),
      ...(parsed.partner ? { partner: parsed.partner } : {}),
      ...(parsed.accessId ? { accessId: parsed.accessId } : {}),
    });
  }

  hydrateFromEnvironment(): void {
    const raw = process.env.CELESC_ACCESS_TOKEN?.trim();
    if (!raw) return;
    const token = normalizeAccessTokenFromEnv(raw);
    if (!token) return;
    this.sessionStore.setSession({
      accessToken: token,
      updatedAt: new Date().toISOString(),
    });
  }

  async signOut(): Promise<void> {
    const token = this.sessionStore.getAccessToken();
    if (token) {
      try {
        await this.authRepository.logout(token);
      } catch {
        /* still clear local session */
      }
    }
    this.sessionStore.clear();
  }
}
