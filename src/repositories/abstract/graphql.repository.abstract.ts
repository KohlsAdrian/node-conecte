import type { CelescConfig } from "../../config/celesc.config.js";
import type {
  GraphqlPayload,
  GraphqlResponse,
} from "../../domain/session.types.js";
import { CelescGraphqlError } from "../../domain/errors.js";
import type { SessionStore } from "../../state/abstract/session-store.abstract.js";
import { AuthenticatedCelescRepository } from "./authenticated-celesc.repository.js";

export type GraphqlRepositoryOptions = {
  /**
   * SAP `/graphql` expects the opaque token from `/auth/login`.
   * Strapi `/cms/graphql` treats that same Bearer as invalid — omit it (browser often hits CMS as public).
   */
  sendBearer?: boolean;
};

/**
 * GraphQL over POST with shared error handling.
 */
export abstract class GraphqlRepository extends AuthenticatedCelescRepository {
  private readonly graphqlPath: string;
  private readonly sendBearer: boolean;

  protected constructor(
    config: CelescConfig,
    sessionStore: SessionStore,
    graphqlPath: string,
    options?: GraphqlRepositoryOptions,
  ) {
    super(config, sessionStore);
    this.graphqlPath = graphqlPath;
    this.sendBearer = options?.sendBearer !== false;
  }

  protected graphqlBrowserHeaders(): Record<string, string> {
    const h: Record<string, string> = {
      Origin: new URL(this.config.baseUrl).origin,
    };
    if (this.config.loginCookieHeader) {
      h.Cookie = this.config.loginCookieHeader;
    }
    if (this.config.loginUserAgent) {
      h["User-Agent"] = this.config.loginUserAgent;
    }
    return h;
  }

  async execute<TData, V extends Record<string, unknown> = Record<string, unknown>>(
    payload: GraphqlPayload<V>,
  ): Promise<TData> {
    const body = {
      query: payload.query,
      variables: payload.variables ?? {},
      ...(payload.operationName
        ? { operationName: payload.operationName }
        : {}),
    };

    const browserLike = this.graphqlBrowserHeaders();
    let json: GraphqlResponse<TData>;

    if (this.sendBearer) {
      json = await this.postJsonAuthorized<GraphqlResponse<TData>>(
        this.graphqlPath,
        body,
        browserLike,
      );
    } else {
      json = await this.postJson<GraphqlResponse<TData>>(this.graphqlPath, body, {
        "execution-requester": "GRPB",
        ...browserLike,
      });
    }

    if (json.errors?.length) {
      const msg = json.errors.map((e) => e.message).join("; ");
      throw new CelescGraphqlError(msg, json.errors);
    }

    if (json.data === undefined) {
      throw new CelescGraphqlError("GraphQL response missing data", []);
    }

    return json.data;
  }
}
