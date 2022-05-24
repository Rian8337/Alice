import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseMultiplayerRoom } from "@alice-interfaces/database/aliceDb/DatabaseMultiplayerRoom";
import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { MultiplayerRoomSettings } from "@alice-interfaces/multiplayer/MultiplayerRoomSettings";
import { MultiplayerRoomStatus } from "@alice-interfaces/multiplayer/MultiplayerRoomStatus";
import { MultiplayerScore } from "@alice-interfaces/multiplayer/MultiplayerScore";
import { Language } from "@alice-localization/base/Language";
import {
    MultiplayerRoomLocalization,
    MultiplayerRoomStrings,
} from "@alice-localization/database/utils/aliceDb/MultiplayerRoom/MultiplayerRoomLocalization";
import { Manager } from "@alice-utils/base/Manager";
import { Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { ObjectId } from "mongodb";

/**
 * Represents a multiplayer room.
 */
export class MultiplayerRoom
    extends Manager
    implements DatabaseMultiplayerRoom
{
    readonly roomId: string;
    textChannelId: Snowflake;
    threadChannelId: Snowflake;
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
        this.textChannelId = data.textChannelId;
        this.threadChannelId = data.threadChannelId;
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
                    textChannelId: this.textChannelId,
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
        const text: TextChannel = <TextChannel>(
            await this.client.channels.fetch(this.textChannelId)
        );

        const thread: ThreadChannel | null = await text.threads.fetch(
            this.textChannelId
        );

        if (thread) {
            if (!thread.locked) {
                await thread.setLocked(true, "Multiplayer room closed");
            }

            if (!thread.archived) {
                await thread.setArchived(true, "Multiplayer room closed");
            }
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

        let key: keyof MultiplayerRoomStrings;

        switch (this.settings.winCondition) {
            case MultiplayerWinCondition.scoreV1:
                key = "scoreV1";
                break;
            case MultiplayerWinCondition.accuracy:
                key = "accuracy";
                break;
            case MultiplayerWinCondition.maxCombo:
                key = "maxCombo";
                break;
            case MultiplayerWinCondition.scoreV2:
                key = "scoreV2";
                break;
            case MultiplayerWinCondition.most300:
                key = "most300s";
                break;
            case MultiplayerWinCondition.least100:
                key = "least100s";
                break;
            case MultiplayerWinCondition.least50:
                key = "least50s";
                break;
            case MultiplayerWinCondition.leastMisses:
                key = "leastMisses";
                break;
            case MultiplayerWinCondition.leastUnstableRate:
                key = "leastUnstableRate";
                break;
            case MultiplayerWinCondition.mostDroidPp:
                key = "mostDroidPp";
                break;
            case MultiplayerWinCondition.mostPcPp:
                key = "mostPcPp";
                break;
        }

        return localization.getTranslation(key);
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
     * Gets the string representation of a team.
     *
     * @param language The language to localize. Defaults to English.
     */
    teamToString(team: MultiplayerTeam, language: Language = "en"): string {
        const localization: MultiplayerRoomLocalization =
            this.getLocalization(language);

        switch (team) {
            case MultiplayerTeam.red:
                return localization.getTranslation("redTeam");
            case MultiplayerTeam.blue:
                return localization.getTranslation("blueTeam");
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
