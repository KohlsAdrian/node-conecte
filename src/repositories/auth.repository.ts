import type { CelescConfig } from "../config/celesc.config.js";
import { defaultLogoutReferer } from "../config/celesc.config.js";
import type { LoginRequest } from "../domain/session.types.js";
import { BaseCelescRepository } from "./abstract/base-celesc.repository.js";

export type LoginResponse = Record<string, unknown>;

export type LoginRequestOptions = {
  referer?: string;
};

export type LogoutRequestOptions = {
  referer?: string;
};

/**
 * `POST /auth/login` — email/password and/or session cookies; response carries `accessToken`.
 */
export class AuthRepository extends BaseCelescRepository {
  constructor(config: CelescConfig) {
    super(config);
  }

  login(
    body: LoginRequest,
    options?: LoginRequestOptions,
  ): Promise<LoginResponse> {
    const headers: Record<string, string> = {
      Origin: new URL(this.config.baseUrl).origin,
    };
    if (this.config.loginCookieHeader) {
      headers.Cookie = this.config.loginCookieHeader;
    }
    if (this.config.loginUserAgent) {
      headers["User-Agent"] = this.config.loginUserAgent;
    }
    const referer = options?.referer ?? this.config.loginReferer;
    if (referer) {
      headers.Referer = referer;
    }
    return this.postJson<LoginResponse>("/auth/login", body, headers);
  }

  /**
   * `POST /auth/logout` — HAR: `Authorization: Bearer`, body `{}`, response 204.
   */
  async logout(
    accessToken: string,
    options?: LogoutRequestOptions,
  ): Promise<void> {
    const referer =
      options?.referer ??
      this.config.logoutReferer ??
      defaultLogoutReferer(this.config);
    const headers: Record<string, string> = {
      Origin: new URL(this.config.baseUrl).origin,
      Authorization: `Bearer ${accessToken}`,
    };
    if (this.config.loginCookieHeader) {
      headers.Cookie = this.config.loginCookieHeader;
    }
    if (this.config.loginUserAgent) {
      headers["User-Agent"] = this.config.loginUserAgent;
    }
    headers.Referer = referer;
    await this.postJson<unknown>("/auth/logout", {}, headers);
  }
}
