import { describe, expect, it } from "vitest";
import { StringHelper } from "./StringHelper";

describe("StringHelper.truncate", () => {
    it("truncates descriptions to 1024 characters", () => {
        const fits = "a".repeat(1024);
        const tooLong = "a".repeat(1025);

        expect(StringHelper.truncate(fits, 1024)).toBe(fits);

        const truncated = StringHelper.truncate(tooLong, 1024);

        expect(truncated).toHaveLength(1024);
        expect(truncated.endsWith("…")).toBe(true);
        expect(truncated).toBe("a".repeat(1023) + "…");
    });

    it("returns short text unchanged", () => {
        expect(StringHelper.truncate("short", 1024)).toBe("short");
    });
});
