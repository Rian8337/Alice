import { Modes } from "@rian8337/osu-base";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";
import { describe, expect, it } from "vitest";
import { checkVariant, variantRejectionKey } from "./variantChoice";

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

    it("classifies an unavailable variant as unavailable", () => {
        expect(checkVariant(variant({ available: false }), Modes.Droid)).toBe(
            "unavailable",
        );
    });

    it("classifies an unavailable variant of another mode as unavailable", () => {
        expect(
            checkVariant(
                variant({ available: false, mode: Modes.Osu }),
                Modes.Droid,
            ),
        ).toBe("unavailable");
    });

    it("classifies an unreachable variant list as list unavailable", () => {
        expect(checkVariant(undefined, Modes.Droid)).toBe("listUnavailable");
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

describe("variantRejectionKey", () => {
    it("maps every rejected check to a localization key", () => {
        expect(variantRejectionKey("ok")).toBeNull();
        expect(variantRejectionKey("notFound")).toBe("variantNotFound");
        expect(variantRejectionKey("unavailable")).toBe("variantUnavailable");
        expect(variantRejectionKey("wrongMode")).toBe("variantWrongMode");
        expect(variantRejectionKey("listUnavailable")).toBe(
            "variantListUnavailable",
        );
    });

    it("lets stored data be read for an unavailable variant", () => {
        expect(variantRejectionKey("unavailable", true)).toBeNull();
        expect(variantRejectionKey("notFound", true)).toBe("variantNotFound");
        expect(variantRejectionKey("listUnavailable", true)).toBe(
            "variantListUnavailable",
        );
    });
});
