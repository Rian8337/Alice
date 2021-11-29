import { PartialProfileBackground } from "@alice-interfaces/profile/PartialProfileBackground";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a database profile badge.
 */
export interface DatabaseProfileBadge extends BaseDocument, PartialProfileBackground {
    /**
     * The description of the badge.
     */
    description: string;

    /**
     * The type of the badge.
     */
    type: "dpp" | "score_total" | "score_ranked" | "star_fc" | "unclaimable";

    /**
     * The requirement needed to get the badge in respect of its type.
     */
    requirement: number;
}