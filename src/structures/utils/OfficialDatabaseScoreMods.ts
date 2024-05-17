import { IModApplicableToDroid, Mod } from "@rian8337/osu-base";

/**
 * Represents the mods of a score in the official database.
 */
export interface OfficialDatabaseScoreMods {
    /**
     * The mods of the score.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The speed multiplier of the score.
     */
    readonly speedMultiplier: number;

    /**
     * The force CS of the score.
     */
    readonly forceCS?: number;

    /**
     * The force AR of the score.
     */
    readonly forceAR?: number;

    /**
     * The force OD of the score.
     */
    readonly forceOD?: number;

    /**
     * The force HP of the score.
     */
    readonly forceHP?: number;

    /**
     * The flashlight follow delay of the score.
     */
    readonly flashlightFollowDelay?: number;

    /**
     * Whether the score was set in version 1.6.7 or lower.
     */
    readonly oldStatistics: boolean;
}
