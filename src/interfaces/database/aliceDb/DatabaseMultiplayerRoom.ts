import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { MultiplayerRoomSettings } from "@alice-interfaces/multiplayer/MultiplayerRoomSettings";
import { MultiplayerRoomStatus } from "@alice-interfaces/multiplayer/MultiplayerRoomStatus";
import { MultiplayerScore } from "@alice-interfaces/multiplayer/MultiplayerScore";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a multiplayer room.
 */
export interface DatabaseMultiplayerRoom extends BaseDocument {
    /**
     * The ID of the room.
     */
    readonly roomId: string;

    /**
     * The ID of the Discord channel at which this room resides.
     */
    channelId: Snowflake;

    /**
     * The players in this room.
     */
    players: MultiplayerPlayer[];

    /**
     * The status of this room.
     */
    status: MultiplayerRoomStatus;

    /**
     * The room's settings.
     */
    settings: MultiplayerRoomSettings;

    /**
     * The scores from the currently played beatmap that have been set.
     */
    currentScores: MultiplayerScore[];
}
