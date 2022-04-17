import { MinPlayers } from "@alice-types/tournament/MinPlayers";

/**
 * Represents a tournament beatmap in a tournament mappool.
 */
export interface TournamentBeatmap {
    /**
     * The pick ID of this beatmap.
     */
    pickId: string;

    /**
     * The name of this beatmap.
     */
    name: string;

    /**
     * The osu!droid maximum score of this beatmap with required mods applied.
     */
    maxScore: number;

    /**
     * The MD5 hash of this beatmap.
     */
    hash: string;

    /**
     * The duration of this beatmap until the end of the last object, in seconds.
     */
    duration: number;

    /**
     * The portion of which the maximum score will contribute to ScoreV2.
     */
    scorePortion: number;

    /**
     * The combination of mods that must be used when playing this beatmap.
     */
    requiredMods: string;

    /**
     * The combination of mods that can be used when playing this beatmap.
     */
    allowedMods: string;

    /**
     * The minimum amount of players playing this pick with required mods.
     */
    minPlayers: MinPlayers;
}
