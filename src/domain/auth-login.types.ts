/**
 * Successful `/auth/login` JSON from conecte.celesc.com.br (token at authenticate.login).
 */
export type CelescLoginDocumentAccess = {
  categories: unknown;
};

export type CelescLoginTokenBlock = {
  accessToken: string;
  tokenType?: string;
  documentAccess?: CelescLoginDocumentAccess | null;
};

export type CelescLoginProfile = {
  email?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  sub?: string | null;
};

export type CelescLoginSapAccess = {
  channel?: string | null;
  userId?: string | null;
  accessType?: string | null;
  partner?: string | null;
  accessId?: string | null;
  protocol?: string | null;
  message?: string | null;
  error?: string | null;
};

export type CelescAuthenticatePayload = {
  login: CelescLoginTokenBlock;
  profile?: CelescLoginProfile | null;
  sapAccess?: CelescLoginSapAccess | null;
  message?: string | null;
};

export type CelescLoginResponseBody = {
  data?: {
    authenticate?: CelescAuthenticatePayload | null;
  };
};
