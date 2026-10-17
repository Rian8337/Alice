import { DefaultPPVariants } from "./DefaultPPVariants";

/**
 * Determines which variants a prototype recalculation of a variant is compared against.
 *
 * @param variant The canonical name of the variant that is being recalculated.
 * @returns The variants to calculate with: `live` is the current live variant, `local` is the variant being
 * recalculated, and `master` is the `droid-rebalance` variant, which is absent when `droid-rebalance` itself is
 * being recalculated.
 */
export function prototypeVariants(variant: string): {
    live: string;
    local: string;
    master?: string;
} {
    return {
        live: DefaultPPVariants.droidLive,
        local: variant,
        ...(variant !== DefaultPPVariants.droidRebalance && {
            master: DefaultPPVariants.droidRebalance,
        }),
    };
}
