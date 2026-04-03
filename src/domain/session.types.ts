export type CelescSession = {
  accessToken: string;
  /** ISO timestamp when the token was last set */
  updatedAt: string;
  userId?: string;
  partner?: string;
  accessId?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
  /** Empty for email/password login */
  socialCode: string;
  /** Empty for email/password login */
  socialRedirectUri: string;
  channel: string;
  accessIp: string;
  deviceId: string;
  firebaseToken: string;
};

export type GraphqlPayload<V extends Record<string, unknown> = Record<string, never>> = {
  query: string;
  variables?: V;
  operationName?: string;
};

export type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};
