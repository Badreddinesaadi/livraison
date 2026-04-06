import * as SecureStore from "expo-secure-store";
import { apiUrl, queryClient } from "./query";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  pathname?: string;
  /** Add search params to be appended to the request URL */
  searchParams?:
    | Record<string, string | number | boolean | null | undefined>
    | URLSearchParams;
  isDebug?: boolean;
  withPagination?: boolean;
}

export type Pagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T | null;
  pagination: Pagination | null;
};

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

  async request<T = any>(
    options: RequestOptions & { withPagination: true },
  ): Promise<PaginatedResult<T>>;
  async request<T = any>(
    options?: RequestOptions & { withPagination?: false },
  ): Promise<T | null>;
  async request<T = any>(
    options: RequestOptions = {},
  ): Promise<T | null | PaginatedResult<T>> {
    const {
      method = "GET",
      body,
      headers = {},
      pathname = "",
      isDebug = false,
      withPagination = false,
    } = options;

    const url = this.baseUrl + pathname;
    let finalUrl = url;

    if (
      options.searchParams &&
      !(options.searchParams instanceof URLSearchParams)
    ) {
      const entries: [string, string][] = Object.entries(
        options.searchParams,
      ).reduce(
        (acc, [k, v]) => {
          if (v === undefined || v === null) return acc;
          acc.push([k, String(v)]);
          return acc;
        },
        [] as [string, string][],
      );

      if (entries.length) {
        const params = new URLSearchParams(entries);
        finalUrl += (url.includes("?") ? "&" : "?") + params.toString();
      }
    } else if (options.searchParams instanceof URLSearchParams) {
      const params = options.searchParams.toString();
      if (params) finalUrl += (url.includes("?") ? "&" : "?") + params;
    }
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    if (!mergedHeaders["auth_token"]) {
      // get the token from local storage and add it to the headers if it exists
      let sessionToken = await SecureStore.getItemAsync("sessionToken");
      if (sessionToken) {
        mergedHeaders["auth_token"] = sessionToken;
      }
    }

    const isFormDataBody =
      typeof FormData !== "undefined" && body instanceof FormData;

    if (isFormDataBody) {
      delete mergedHeaders["Content-Type"];
    }

    const fetchOptions: RequestInit = {
      method,
      headers: mergedHeaders,
    };

    if (body) {
      fetchOptions.body = isFormDataBody ? body : JSON.stringify(body);
    }

    if (isDebug && __DEV__) {
      console.log("\n====== API REQUEST DEBUG ======");
      console.log("URL:", finalUrl);
      console.log("Method:", method);
      console.log("Headers:", JSON.stringify(mergedHeaders, null, 2));
      console.log("Body:", body ? JSON.stringify(body, null, 2) : "(none)");
      console.log("==============================\n");
    }

    const response = await fetch(finalUrl, fetchOptions);
    const data = await response.json();

    if (isDebug && __DEV__) {
      console.log("\n====== API RESPONSE DEBUG ======");
      console.log("Status:", response.status, response.statusText);
      console.log("Response Data:", JSON.stringify(data, null, 2));
      console.log("================================\n");
    }

    if (data.status === false) {
      if (__DEV__) {
        console.log("API Error (status is false):", data.message);
      }

      if (data.code === 76) {
        // token is expired
        await SecureStore.deleteItemAsync("sessionToken");
        queryClient.setQueryData(["currentUser"], null);
      }

      throw new Error(data.message || "An error occurred");
    }

    if (withPagination) {
      return {
        data: (data.data as T) ?? null,
        pagination: (data.pagination as Pagination) ?? null,
      };
    }

    return data.data as T | null;
  }
}

export const client = new ApiClient();
