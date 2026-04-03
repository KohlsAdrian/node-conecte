import type { AuthStrategyContext } from "./auth-strategy.abstract.js";
import { AuthStrategy } from "./auth-strategy.abstract.js";

/**
 * Email + password login (empty `socialCode` / `socialRedirectUri`), matching the web app.
 */
export class CredentialsAuthStrategy extends AuthStrategy {
  buildLoginRequest(ctx: AuthStrategyContext) {
    const username = ctx.username.trim();
    const password = ctx.password;
    if (!username || !password) {
      throw new Error(
        "CredentialsAuthStrategy requires non-empty username and password",
      );
    }
    return {
      username,
      password,
      socialCode: "",
      socialRedirectUri: "",
      channel: ctx.config.channel,
      accessIp: ctx.accessIp ?? "",
      deviceId: ctx.deviceId ?? ctx.config.defaultDeviceId,
      firebaseToken: ctx.firebaseToken ?? "",
    };
  }
}
