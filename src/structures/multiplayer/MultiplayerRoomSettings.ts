import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { Snowflake } from "discord.js";
import { PickedBeatmap } from "./PickedBeatmap";

/**
 * Represents a multiplayer room's settings.
 */
export interface MultiplayerRoomSettings {
    /**
     * The password required to join the room.
     */
    password?: string;

    /**
     * The name of the room.
     */
    roomName: string;

    /**
     * The Discord ID of the room host.
     */
    roomHost: Snowflake;

    /**
     * The team mode of the room.
     */
    teamMode: MultiplayerTeamMode;

    /**
     * The amount of player slots in the room.
     */
    maxPlayers: number;

    /**
     * The beatmap that is currently being played.
     */
    beatmap: PickedBeatmap | null;

    /**
     * The combination of mods that are required to be played.
     */
    requiredMods: string;

    /**
     * The combination of mods that are allowed to be played.
     */
    allowedMods: string;

    /**
     * The portion of which accuracy will contribute to ScoreV2, if win condition is ScoreV2.
     */
    scorePortion: number;

    /**
     * The win condition of the room.
     */
    winCondition: MultiplayerWinCondition;

    /**
     * The custom speed multiplier to be used.
     */
    speedMultiplier: number;

    /**
     * Whether the in-game slider lock option is allowed.
     */
    allowSliderLock: boolean;

    /**
     * Custom mod multipliers that overrides the client's default mod multiplier.
     *
     * Each mod is mapped to their own mod multiplier.
     */
    modMultipliers: Record<string, number>;

    /**
     * Settings for forced AR.
     */
    forcedAR: {
        /**
         * Whether players are allowed to use forced AR.
         */
        allowed: boolean;

        /**
         * The allowable minimum value of forced AR if it is allowed.
         */
        minValue: number;

        /**
         * The allowable maximum value of forced AR if it is allowed.
         */
        maxValue: number;
    };

    /**
     * Whether this room has spectating enabled.
     */
    spectatorEnabled: boolean;
}
