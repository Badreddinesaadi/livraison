import { apiUrl } from "./query";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  pathname?: string;
  authToken?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = apiUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      login_token: "SDKWOOD",
      code_token: "SDKWOOD/2026@!!",
    };
  }

  async request<T = any>(options: RequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      body,
      headers = {},
      pathname = "",
      authToken,
    } = options;

    const url = this.baseUrl + pathname;
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    if (authToken) {
      mergedHeaders["auth_token"] = authToken;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: mergedHeaders,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (data.status === false) {
      throw new Error(data.message || "An error occurred");
    }

    return data.data as T;
  }
}

export const client = new ApiClient();
