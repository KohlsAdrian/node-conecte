export class CelescHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "CelescHttpError";
  }
}

export class CelescGraphqlError extends Error {
  constructor(
    message: string,
    readonly errors: readonly { message: string }[],
  ) {
    super(message);
    this.name = "CelescGraphqlError";
  }
}

export class AuthenticationRequiredError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}
