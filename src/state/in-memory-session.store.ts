import type { CelescSession } from "../domain/session.types.js";
import { SessionStore } from "./abstract/session-store.abstract.js";

export class InMemorySessionStore extends SessionStore {
  private session: CelescSession | null = null;

  getSession(): CelescSession | null {
    return this.session;
  }

  setSession(session: CelescSession): void {
    this.session = session;
  }

  clear(): void {
    this.session = null;
  }
}
