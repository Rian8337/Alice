/**
 * Represents a bonus tier.
 */
export interface BonusTier {
    /**
     * The level of the tier.
     */
    level: number;

    /**
     * The value that needs to be fulfilled to gain this bonus tier.
     */
    value: string | number;
}
