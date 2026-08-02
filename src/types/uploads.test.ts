import { describe, expect, it } from "vitest";
import { uploadPercentage } from "./uploads";

describe("uploadPercentage", () => {
    it("converts loaded bytes to a clamped percentage", () => {
        expect(uploadPercentage(25, 100)).toBe(25);
        expect(uploadPercentage(140, 100)).toBe(100);
        expect(uploadPercentage(-10, 100)).toBe(0);
    });

    it("returns null when total size is unknown", () => {
        expect(uploadPercentage(20)).toBeNull();
        expect(uploadPercentage(20, 0)).toBeNull();
    });
});
