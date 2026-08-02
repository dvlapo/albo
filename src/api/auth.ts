import { publicApi } from "./client";
import type { AuthTokens } from "./types";

export const authApi = {
    signup: (values: { name: string; email: string; password: string }) =>
        publicApi.post<AuthTokens>("/auth/signup", values).then((r) => r.data),
    login: (values: { email: string; password: string }) =>
        publicApi.post<AuthTokens>("/auth/login", values).then((r) => r.data),
    refresh: (refresh_token: string) =>
        publicApi
            .post<AuthTokens>("/auth/refresh", { refresh_token })
            .then((r) => r.data),
};
