import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";

/**
 * Represents a player in a multiplayer room.
 */
export interface MultiplayerPlayer {
    /**
     * The UID of the player.
     */
    readonly uid: number;

    /**
     * The username of the player.
     */
    readonly username: string;

    /**
     * The Discord ID of the player.
     */
    readonly discordId: string;

    /**
     * Whether the player is ready.
     */
    isReady: boolean;

    /**
     * Whether the player is spectating. Should only be usable by the room's host.
     */
    isSpectating: boolean;

    /**
     * The mods used by the player, in droid mod string.
     */
    mods: string;

    /**
     * The team this player is at, if in Team VS team mode.
     */
    team?: MultiplayerTeam;

    /**
     * The forced AR setting used by the player.
     */
    forcedAR?: number;
}
