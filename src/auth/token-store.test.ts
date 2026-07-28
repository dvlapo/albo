import { beforeEach, describe, expect, it } from "vitest";
import { guestSessionStore, tokenStore } from "./token-store";

describe("token stores", () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        tokenStore.clear();
    });
    it("stores and clears owner tokens", () => {
        tokenStore.set({ access_token: "access", refresh_token: "refresh" });
        expect(tokenStore.getAccess()).toBe("access");
        expect(tokenStore.getRefresh()).toBe("refresh");
        tokenStore.clear();
        expect(tokenStore.getAccess()).toBeNull();
    });
    it("isolates guest sessions by share token", () => {
        guestSessionStore.set("one", "token-one");
        guestSessionStore.set("two", "token-two");
        expect(guestSessionStore.get("one")).toBe("token-one");
        guestSessionStore.remove("one");
        expect(guestSessionStore.get("one")).toBeNull();
        expect(guestSessionStore.get("two")).toBe("token-two");
    });
});
