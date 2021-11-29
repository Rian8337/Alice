import { PowerupType } from "@alice-types/clan/PowerupType";

/**
 * Represents a clan powerup.
 */
export interface Powerup {
    /**
     * The name of the powerup.
     */
    name: PowerupType;

    /**
     * The amount of this powerup that the clan has.
     */
    amount: number;
}