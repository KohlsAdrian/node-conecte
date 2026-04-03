import { loadCelescConfig } from "../config/celesc.config.js";
import {
  CMS_CONSUMER_UNIT_TYPES,
  CMS_FOOTERS,
  CMS_LAYOUT_BUNDLE,
  CMS_NAVBARS,
  CMS_SCHEDULING_CONFIGS,
  CMS_UNIT_SELECTION_PAGE,
  GET_ALL_REQUEST_TRACKINGS,
  GET_REQUEST_TRACKING_STATUS,
  SAP_ALL_CONTRACTS,
} from "../domain/graphql/operations.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { CmsGraphqlRepository } from "../repositories/cms-graphql.repository.js";
import { SapGraphqlRepository } from "../repositories/sap-graphql.repository.js";
import { CelescSessionManager } from "../state/celesc-session.manager.js";
import { InMemorySessionStore } from "../state/in-memory-session.store.js";
import { CredentialsAuthStrategy } from "../strategies/auth/credentials-auth.strategy.js";

export type RequestTrackingInput = {
  channel: string;
  partner: string;
  installation: string;
};

export type RequestTrackingStatusInput = {
  channel: string;
  protocol: string;
};

export type AllContractsInput = {
  partner: string;
  profileType?: string | null;
  installation?: string | null;
  owner?: string | null;
  zipCode?: string | null;
};

function hasEnvPasswordCredentials(): boolean {
  const username = process.env.CELESC_USERNAME?.trim() ?? "";
  const password = process.env.CELESC_PASSWORD ?? "";
  return Boolean(username && password);
}

/**
 * Composition root: wires config, session store, repositories, and session manager.
 */
export class CelescClient {
  readonly sessionStore = new InMemorySessionStore();
  readonly config = loadCelescConfig();
  readonly authRepository = new AuthRepository(this.config);
  readonly sessionManager = new CelescSessionManager(
    this.config,
    this.sessionStore,
    this.authRepository,
  );
  readonly sap = new SapGraphqlRepository(this.config, this.sessionStore);
  readonly cms = new CmsGraphqlRepository(this.config, this.sessionStore);

  constructor() {
    // Do not load CELESC_ACCESS_TOKEN when email/password login will run — a stale token
    // would skip sign-in and break GraphQL (e.g. CMS "Invalid token.").
    if (!hasEnvPasswordCredentials()) {
      this.sessionManager.hydrateFromEnvironment();
    }
  }

  /** Uses `CELESC_USERNAME` and `CELESC_PASSWORD` from the environment. */
  async signInFromEnv(): Promise<void> {
    const username = process.env.CELESC_USERNAME?.trim() ?? "";
    const password = process.env.CELESC_PASSWORD ?? "";
    if (!username || !password) return;
    await this.signInWithPassword(username, password);
  }

  async signInWithPassword(username: string, password: string): Promise<void> {
    await this.sessionManager.signIn(new CredentialsAuthStrategy(), {
      username,
      password,
    });
  }

  /** `POST /auth/logout` then clear local session. */
  signOut(): Promise<void> {
    return this.sessionManager.signOut();
  }

  getAllRequestTrackings(input: RequestTrackingInput) {
    return this.sap.execute({
      query: GET_ALL_REQUEST_TRACKINGS,
      variables: {
        channelCode: this.config.channel,
        target: "sap",
        requestTrackingInput: input,
      },
    });
  }

  getRequestTrackingStatus(input: RequestTrackingStatusInput) {
    return this.sap.execute({
      query: GET_REQUEST_TRACKING_STATUS,
      variables: {
        channelCode: this.config.channel,
        target: "sap",
        requestTrackingStatusInput: input,
      },
    });
  }

  getNavbars(channelCode = "WEB") {
    return this.cms.execute({
      query: CMS_NAVBARS,
      variables: { channelCode },
    });
  }

  getUnitSelectionPage(
    channelCode = "WEB",
    pageName = "unit-selection-individuals-global",
  ) {
    return this.cms.execute({
      query: CMS_UNIT_SELECTION_PAGE,
      variables: { channelCode, pageName },
    });
  }

  getConsumerUnitTypes() {
    return this.cms.execute({
      query: CMS_CONSUMER_UNIT_TYPES,
      variables: {},
    });
  }

  /**
   * Fetches navbars, footers, schedulingConfigs, and consumerUnitTypes in a single CMS request.
   */
  getCmsLayoutBundle(
    channelCode = "WEB",
    profileType = "GRPB",
  ) {
    return this.cms.execute({
      query: CMS_LAYOUT_BUNDLE,
      variables: { channelCode, profileType },
    });
  }

  getAllContracts(input: AllContractsInput) {
    return this.sap.execute({
      query: SAP_ALL_CONTRACTS,
      variables: {
        channelCode: this.config.channel,
        target: "sap",
        partner: input.partner,
        profileType: input.profileType ?? null,
        installation: input.installation ?? null,
        owner: input.owner ?? null,
        zipCode: input.zipCode ?? null,
      },
    });
  }

  getFooters(channelCode = "WEB", profileType = "GRPB") {
    return this.cms.execute({
      query: CMS_FOOTERS,
      variables: { channelCode, profileType },
    });
  }

  getSchedulingConfigs() {
    return this.cms.execute({
      query: CMS_SCHEDULING_CONFIGS,
      variables: {},
    });
  }
}
