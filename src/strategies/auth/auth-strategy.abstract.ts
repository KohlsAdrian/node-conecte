import type { CelescConfig } from "../../config/celesc.config.js";
import type { LoginRequest } from "../../domain/session.types.js";

export type AuthStrategyContext = {
  config: CelescConfig;
  username: string;
  password: string;
  accessIp?: string;
  deviceId?: string;
  firebaseToken?: string;
};

/** Builds the JSON body for `POST /auth/login`. */
export abstract class AuthStrategy {
  abstract buildLoginRequest(ctx: AuthStrategyContext): LoginRequest;
}
