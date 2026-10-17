import { Modes } from "@rian8337/osu-base";
import { PPVariantSummary } from "@structures/utils/PPVariantSummary";

/**
 * The outcome of checking a resolved variant.
 */
export type VariantCheckResult =
    "ok" | "notFound" | "unavailable" | "wrongMode" | "listUnavailable";

/**
 * The localization keys that a command uses to reject a variant.
 */
export type VariantRejectionKey =
    | "variantNotFound"
    | "variantUnavailable"
    | "variantWrongMode"
    | "variantListUnavailable";

/**
 * Checks whether a resolved variant can be used to calculate for a gamemode.
 *
 * @param variant The resolved variant, `null` if the variant does not exist or is not visible, and `undefined` if the
 * variant list could not be retrieved.
 * @param mode The gamemode that the variant is expected to calculate.
 * @returns `ok` if the variant can be used, `notFound` if there is no variant, `unavailable` if the variant is marked
 * as unavailable or its mode or algorithm is not known yet, `wrongMode` if the variant calculates another gamemode, and
 * `listUnavailable` if the variant list could not be retrieved.
 */
export function checkVariant(
    variant: PPVariantSummary | null | undefined,
    mode: Modes,
): VariantCheckResult {
    if (variant === undefined) {
        return "listUnavailable";
    }

    if (variant === null) {
        return "notFound";
    }

    if (
        variant.mode === null ||
        variant.algorithm === null ||
        !variant.available
    ) {
        return "unavailable";
    }

    if (variant.mode !== mode) {
        return "wrongMode";
    }

    return "ok";
}

/**
 * Gets the localization key of the rejection for a variant check.
 *
 * @param check The result of {@link checkVariant}.
 * @param allowUnavailable Whether an unavailable variant is accepted. This is for commands that only read stored data,
 * which does not need the variant to be available.
 * @returns The localization key, `null` if the variant is accepted.
 */
export function variantRejectionKey(
    check: VariantCheckResult,
    allowUnavailable: true,
): Exclude<VariantRejectionKey, "variantUnavailable"> | null;
export function variantRejectionKey(
    check: VariantCheckResult,
    allowUnavailable?: false,
): VariantRejectionKey | null;
export function variantRejectionKey(
    check: VariantCheckResult,
    allowUnavailable?: boolean,
): VariantRejectionKey | null {
    switch (check) {
        case "ok":
            return null;
        case "notFound":
            return "variantNotFound";
        case "unavailable":
            return allowUnavailable ? null : "variantUnavailable";
        case "wrongMode":
            return "variantWrongMode";
        case "listUnavailable":
            return "variantListUnavailable";
    }
}
