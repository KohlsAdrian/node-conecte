import type { CelescConfig } from "../../config/celesc.config.js";
import type { SessionStore } from "../../state/abstract/session-store.abstract.js";
import { AuthenticationRequiredError } from "../../domain/errors.js";
import type { JsonBody } from "./base-celesc.repository.js";
import { BaseCelescRepository } from "./base-celesc.repository.js";

/**
 * Adds Bearer auth from {@link SessionStore}. Callers should ensure session is populated.
 */
export abstract class AuthenticatedCelescRepository extends BaseCelescRepository {
  protected constructor(
    config: CelescConfig,
    protected readonly sessionStore: SessionStore,
  ) {
    super(config);
  }

  protected requireToken(): string {
    const token = this.sessionStore.getAccessToken();
    if (!token) {
      throw new AuthenticationRequiredError("Missing access token");
    }
    return token;
  }

  protected async postJsonAuthorized<TResponse>(
    path: string,
    body: JsonBody,
    extraHeaders: Record<string, string> = {},
  ): Promise<TResponse> {
    const token = this.requireToken();
    return this.postJson<TResponse>(path, body, {
      Authorization: `Bearer ${token}`,
      "execution-requester": "GRPB",
      ...extraHeaders,
    });
  }
}
