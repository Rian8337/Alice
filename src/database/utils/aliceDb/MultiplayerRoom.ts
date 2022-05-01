import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseMultiplayerRoom } from "@alice-interfaces/database/aliceDb/DatabaseMultiplayerRoom";
import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { MultiplayerRoomSettings } from "@alice-interfaces/multiplayer/MultiplayerRoomSettings";
import { MultiplayerRoomStatus } from "@alice-interfaces/multiplayer/MultiplayerRoomStatus";
import { MultiplayerScore } from "@alice-interfaces/multiplayer/MultiplayerScore";
import { Language } from "@alice-localization/base/Language";
import { MultiplayerRoomLocalization } from "@alice-localization/database/utils/aliceDb/MultiplayerRoom/MultiplayerRoomLocalization";
import { Manager } from "@alice-utils/base/Manager";
import { Snowflake, ThreadChannel } from "discord.js";
import { ObjectId } from "mongodb";

/**
 * Represents a multiplayer room.
 */
export class MultiplayerRoom
    extends Manager
    implements DatabaseMultiplayerRoom
{
    readonly roomId: string;
    channelId: Snowflake;
    players: MultiplayerPlayer[];
    status: MultiplayerRoomStatus;
    currentScores: MultiplayerScore[];
    settings: MultiplayerRoomSettings;
    _id?: ObjectId;

    constructor(
        data: DatabaseMultiplayerRoom = DatabaseManager.aliceDb?.collections
            .multiplayerRoom.defaultDocument ?? {}
    ) {
        super();

        this.roomId = data.roomId;
        this.channelId = data.channelId;
        this.players = data.players;
        this.status = data.status;
        this.currentScores = data.currentScores;
        this.settings = data.settings;
        this._id = data._id;
    }

    /**
     * Updates the current state of the room.
     */
    updateRoom(): Promise<OperationResult> {
        return DatabaseManager.aliceDb.collections.multiplayerRoom.update(
            { roomId: this.roomId },
            {
                $set: {
                    channelId: this.channelId,
                    players: this.players,
                    status: this.status,
                    currentScores: this.currentScores,
                    settings: this.settings,
                },
            }
        );
    }

    /**
     * Deletes this room from the database.
     */
    async deleteRoom(): Promise<OperationResult> {
        const thread: ThreadChannel = <ThreadChannel>(
            await this.client.channels.fetch(this.channelId)
        );

        if (!thread.locked) {
            await thread.setLocked(true, "Multiplayer room closed");
        }

        if (!thread.archived) {
            await thread.setArchived(true, "Multiplayer room closed");
        }

        return DatabaseManager.aliceDb.collections.multiplayerRoom.delete({
            roomId: this.roomId,
        });
    }

    /**
     * Gets the string representation of the current win condition.
     *
     * @param language The language to localize. Defaults to English.
     */
    winConditionToString(language: Language = "en"): string {
        const localization: MultiplayerRoomLocalization =
            this.getLocalization(language);

        switch (this.settings.winCondition) {
            case MultiplayerWinCondition.scoreV1:
                return localization.getTranslation("scoreV1");
            case MultiplayerWinCondition.accuracy:
                return localization.getTranslation("accuracy");
            case MultiplayerWinCondition.maxCombo:
                return localization.getTranslation("maxCombo");
            case MultiplayerWinCondition.scoreV2:
                return localization.getTranslation("scoreV2");
            case MultiplayerWinCondition.most300:
                return localization.getTranslation("most300s");
            case MultiplayerWinCondition.least100:
                return localization.getTranslation("least100s");
            case MultiplayerWinCondition.least50:
                return localization.getTranslation("least50s");
            case MultiplayerWinCondition.leastMisses:
                return localization.getTranslation("leastMisses");
            case MultiplayerWinCondition.leastUnstableRate:
                return localization.getTranslation("leastUnstableRate");
        }
    }

    /**
     * Gets the string representation of the current team mode.
     *
     * @param language The language to localize. Defaults to English.
     */
    teamModeToString(language: Language = "en"): string {
        const localization: MultiplayerRoomLocalization =
            this.getLocalization(language);

        switch (this.settings.teamMode) {
            case MultiplayerTeamMode.headToHead:
                return localization.getTranslation("headToHead");
            case MultiplayerTeamMode.teamVS:
                return localization.getTranslation("teamVS");
        }
    }

    /**
     * Gets the localization of this database utility.
     *
     * @param language The language to localize.
     */
    private getLocalization(language: Language): MultiplayerRoomLocalization {
        return new MultiplayerRoomLocalization(language);
    }
}
