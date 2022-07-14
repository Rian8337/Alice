/**
 * Represents the status of a multiplayer room.
 */
export interface MultiplayerRoomStatus {
    /**
     * Whether the currently picked beatmap is being played.
     */
    isPlaying: boolean;

    /**
     * The time at which the current beatmap started playing, in milliseconds.
     */
    playingSince: number;
}
