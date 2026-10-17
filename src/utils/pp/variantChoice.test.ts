import { Modes } from "@rian8337/osu-base";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";
import { describe, expect, it } from "vitest";
import { checkVariant } from "./variantChoice";

function variant(overrides: Partial<PPVariantSummary> = {}): PPVariantSummary {
    return {
        name: "droid-live",
        title: null,
        aliases: [],
        description: null,
        available: true,
        mode: Modes.Droid,
        algorithm: "live",
        calculatorVersion: null,
        builtAt: null,
        ...overrides,
    };
}

describe("checkVariant", () => {
    it("classifies a missing variant as not found", () => {
        expect(checkVariant(null, Modes.Droid)).toBe("notFound");
    });

    it("classifies a variant with no mode as unavailable", () => {
        expect(checkVariant(variant({ mode: null }), Modes.Droid)).toBe(
            "unavailable",
        );
    });

    it("classifies a variant with no algorithm as unavailable", () => {
        expect(checkVariant(variant({ algorithm: null }), Modes.Droid)).toBe(
            "unavailable",
        );
    });

    it("classifies a variant of another mode as wrong mode", () => {
        expect(checkVariant(variant({ mode: Modes.Osu }), Modes.Droid)).toBe(
            "wrongMode",
        );
    });

    it("classifies a variant of the expected mode as ok", () => {
        expect(checkVariant(variant(), Modes.Droid)).toBe("ok");
        expect(checkVariant(variant({ mode: Modes.Osu }), Modes.Osu)).toBe(
            "ok",
        );
    });
});
