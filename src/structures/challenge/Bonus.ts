import { BonusID } from "structures/challenge/BonusID";
import { BonusTier } from "./BonusTier";

/**
 * Represents a daily/weekly challenge bonus.
 */
export interface Bonus {
    /**
     * The ID of the bonus.
     */
    id: BonusID;

    /**
     * The list of tiers that the bonus has.
     */
    list: BonusTier[];
}
