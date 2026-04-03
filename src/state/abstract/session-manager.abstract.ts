import type {
  AuthStrategy,
  AuthStrategyContext,
} from "../../strategies/auth/auth-strategy.abstract.js";

/**
 * Coordinates login strategies and persistence. Subclasses may add refresh, multi-tab sync, etc.
 */
export abstract class SessionManager {
  abstract signIn(
    strategy: AuthStrategy,
    ctx: Omit<AuthStrategyContext, "config">,
  ): Promise<void>;

  /** Load token from env / secure storage without calling `/auth/login`. */
  abstract hydrateFromEnvironment(): void;

  /** Invalidate server session and clear local state. */
  abstract signOut(): Promise<void>;
}
