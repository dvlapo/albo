import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "../auth/token-store";
import type { ApiErrorBody, AuthTokens } from "./types";

export class ApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join(", ") : body.message);
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
export const api = axios.create({ baseURL });
export const publicApi = axios.create({ baseURL });
let refreshPromise: Promise<AuthTokens> | null = null;

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  } else {
    config.headers.set("Content-Type", "application/json");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && tokenStore.getRefresh()) {
      original._retry = true;
      refreshPromise ??= publicApi.post<AuthTokens>("/auth/refresh", { refresh_token: tokenStore.getRefresh() })
        .then(({ data }) => { tokenStore.set(data); return data; })
        .finally(() => { refreshPromise = null; });
      try {
        const tokens = await refreshPromise;
        original.headers.Authorization = `Bearer ${tokens.access_token}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event("albo:logout"));
      }
    }
    const body = error.response?.data ?? { statusCode: 0, message: "Could not reach Albo. Check your connection and try again." };
    return Promise.reject(new ApiError(error.response?.status ?? 0, body));
  },
);

publicApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => Promise.reject(new ApiError(error.response?.status ?? 0, error.response?.data ?? { statusCode: 0, message: "Network request failed." })),
);
