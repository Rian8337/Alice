import { Modes } from "@rian8337/osu-base";

/**
 * A performance points variant, as the broker describes it to clients.
 */
export interface PPVariantSummary {
    /**
     * The canonical name of the variant, also when the variant was looked up by alias.
     */
    name: string;

    /**
     * A short display name, `null` if the variant has none.
     */
    title: string | null;

    /**
     * The aliases of the variant.
     */
    aliases: string[];

    /**
     * The description of the variant, `null` if the variant has none.
     */
    description: string | null;

    /**
     * Whether at least one of the variant's processor instances is healthy.
     */
    available: boolean;

    /**
     * The gamemode that the variant calculates, `null` if it is not known yet.
     */
    mode: Modes | null;

    /**
     * The algorithm that the variant uses, `null` if it is not known yet.
     */
    algorithm: "live" | "rebalance" | null;

    /**
     * The version of the variant's calculator, `null` if it is not known yet.
     */
    calculatorVersion: string | null;

    /**
     * The time the variant's calculator was built at (ISO 8601), `null` if it is not known yet.
     */
    builtAt: string | null;
}
