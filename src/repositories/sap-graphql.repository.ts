import type { CelescConfig } from "../config/celesc.config.js";
import type { SessionStore } from "../state/abstract/session-store.abstract.js";
import { GraphqlRepository } from "./abstract/graphql.repository.abstract.js";

/** Main app GraphQL (`target: sap` in variables when required by operations). */
export class SapGraphqlRepository extends GraphqlRepository {
  constructor(config: CelescConfig, sessionStore: SessionStore) {
    super(config, sessionStore, "/graphql");
  }
}
