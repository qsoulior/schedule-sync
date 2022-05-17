export interface RequestConfig {
  method: "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
  body?: unknown;
  headers?: Headers | Record<string, string>;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  code: number;
  status: string;
  constructor(message: string, code: number, status: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export interface ResponseResult<T> {
  status: number;
  body: T;
  headers?: HeadersInit;
}

export abstract class API {
  private accessToken: string;
  private headers: Headers;
  protected abstract baseURL: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    });
  }

  protected abstract handleError(response: Response): Promise<Error>;

  async sendRequest<T = undefined>(endpoint: string, config: RequestConfig): Promise<ResponseResult<T>> {
    const headers = new Headers(this.headers);
    const configHeaders = new Headers(config.headers);
    configHeaders.forEach((value, key) => headers.append(key, value));

    let error,
      delay = 1,
      retryDelay = 0;
    do {
      const response = await fetch(this.baseURL + endpoint, {
        method: config.method,
        headers: headers,
        body: JSON.stringify(config.body),
      });

      if (response.ok) {
        const body: T = await response.json();
        return { status: response.status, body: body, headers: response.headers };
      }

      error = await this.handleError(response);

      const retryDelayString = response.headers.get("Retry-After");
      if (retryDelayString !== null) {
        retryDelay = parseInt(retryDelayString);
        if (!isNaN(retryDelay)) {
          await sleep(retryDelay * 1000);
          continue;
        } else {
          retryDelay = 0;
        }
      }
      await sleep((delay + Math.random()) * 1000);
      delay *= 2;
    } while (delay <= 16 && retryDelay <= 16);
    throw error;
  }
}
