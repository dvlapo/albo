import type { AuthTokens, GuestSessions } from "../api/types";

const REFRESH_KEY = "albo.owner.refresh.v1";
const GUEST_KEY = "albo.guest.sessions.v1";
let accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set(tokens: AuthTokens) {
    accessToken = tokens.access_token;
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  },
  clear() {
    accessToken = null;
    localStorage.removeItem(REFRESH_KEY);
  },
};

function readGuests(): GuestSessions {
  try {
    return JSON.parse(sessionStorage.getItem(GUEST_KEY) ?? "{}") as GuestSessions;
  } catch {
    return {};
  }
}

export const guestSessionStore = {
  get: (shareToken: string) => readGuests()[shareToken] ?? null,
  set(shareToken: string, token: string) {
    sessionStorage.setItem(GUEST_KEY, JSON.stringify({ ...readGuests(), [shareToken]: token }));
  },
  remove(shareToken: string) {
    const sessions = readGuests();
    delete sessions[shareToken];
    sessionStorage.setItem(GUEST_KEY, JSON.stringify(sessions));
  },
};
