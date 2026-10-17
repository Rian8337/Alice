import { Modes } from "@rian8337/osu-base";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";

/**
 * Checks whether a resolved variant can be used to calculate for a gamemode.
 *
 * @param variant The resolved variant, `null` if the variant does not exist or is not visible.
 * @param mode The gamemode that the variant is expected to calculate.
 * @returns `ok` if the variant can be used, `notFound` if there is no variant, `unavailable` if the variant's mode or
 * algorithm is not known yet, and `wrongMode` if the variant calculates another gamemode.
 */
export function checkVariant(
    variant: PPVariantSummary | null,
    mode: Modes,
): "ok" | "notFound" | "unavailable" | "wrongMode" {
    if (!variant) {
        return "notFound";
    }

    if (variant.mode === null || variant.algorithm === null) {
        return "unavailable";
    }

    if (variant.mode !== mode) {
        return "wrongMode";
    }

    return "ok";
}
