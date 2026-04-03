import type { CelescConfig } from "../../config/celesc.config.js";
import { CelescHttpError } from "../../domain/errors.js";

export type JsonBody = Record<string, unknown> | unknown[];

/**
 * Shared HTTP primitives for Celesc REST/JSON endpoints.
 */
export abstract class BaseCelescRepository {
  protected constructor(protected readonly config: CelescConfig) {}

  protected resolveUrl(path: string): string {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${this.config.baseUrl}${p}`;
  }

  protected async postJson<TResponse>(
    path: string,
    body: JsonBody,
    headers: Record<string, string> = {},
  ): Promise<TResponse> {
    const url = this.resolveUrl(path);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: unknown = null;
    if (text.length > 0) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        throw new CelescHttpError(
          `Non-JSON response (${res.status})`,
          res.status,
          text,
        );
      }
    }

    if (!res.ok) {
      throw new CelescHttpError(
        `HTTP ${res.status} for ${path}`,
        res.status,
        text,
      );
    }

    return json as TResponse;
  }
}
