import type { CelescConfig } from "../config/celesc.config.js";
import type { SessionStore } from "../state/abstract/session-store.abstract.js";
import { GraphqlRepository } from "./abstract/graphql.repository.abstract.js";

/** Strapi-backed CMS GraphQL (no SAP opaque Bearer — Strapi returns "Invalid token." for it). */
export class CmsGraphqlRepository extends GraphqlRepository {
  constructor(config: CelescConfig, sessionStore: SessionStore) {
    super(config, sessionStore, "/cms/graphql", { sendBearer: false });
  }
}
