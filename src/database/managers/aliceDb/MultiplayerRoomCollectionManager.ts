import { DatabaseMultiplayerRoom } from "@alice-interfaces/database/aliceDb/DatabaseMultiplayerRoom";
import { MultiplayerRoom } from "../../utils/aliceDb/MultiplayerRoom";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { GuildMember, Snowflake, User } from "discord.js";

/**
 * A manager for the `multiplayer` collection.
 */
export class MultiplayerRoomCollectionManager extends DatabaseCollectionManager<
    DatabaseMultiplayerRoom,
    MultiplayerRoom
> {
    protected override readonly utilityInstance: new (
        data: DatabaseMultiplayerRoom
    ) => MultiplayerRoom = MultiplayerRoom;

    get defaultDocument(): DatabaseMultiplayerRoom {
        return {
            roomId: "",
            channelId: "",
            players: [],
            status: {
                isPlaying: false,
                playingSince: Date.now(),
            },
            currentScores: [],
            settings: {
                roomName: "",
                roomHost: "",
                teamMode: MultiplayerTeamMode.headToHead,
                requiredMods: "",
                maxPlayers: 8,
                beatmap: null,
                allowedMods: "",
                scorePortion: 0.4,
                winCondition: MultiplayerWinCondition.scoreV1,
                speedMultiplier: 1,
                allowSliderLock: false,
                forcedAR: {
                    allowed: false,
                    minValue: 0,
                    maxValue: 12.5,
                },
            },
        };
    }

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param discordId The Discord ID of the player.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(discordId: Snowflake): Promise<MultiplayerRoom | null>;

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param user The player.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(user: User): Promise<MultiplayerRoom | null>;

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param member The player.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(member: GuildMember): Promise<MultiplayerRoom | null>;

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param uid The uid of the player.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(uid: number): Promise<MultiplayerRoom | null>;

    getFromUser(
        input: Snowflake | User | GuildMember | number
    ): Promise<MultiplayerRoom | null> {
        return this.getOne(
            input instanceof GuildMember || input instanceof User
                ? { "players.discordId": input.id }
                : typeof input === "string"
                ? { "players.discordId": input }
                : { "players.uid": input }
        );
    }

    /**
     * Gets a multiplayer room from its ID.
     *
     * @param roomId The ID of the multiplayer room.
     * @returns The multiplayer room, `null` if there is no multiplayer room with that ID.
     */
    getFromId(roomId: string): Promise<MultiplayerRoom | null> {
        return this.getOne({ roomId: roomId });
    }

    /**
     * Gets a multiplayer room from its channel ID.
     *
     * @param channelId The ID of the channel where the multiplayer room resides on.
     * @returns The multiplayer room, `null` if there is no multiplayer room with that ID.
     */
    getFromChannel(channelId: Snowflake): Promise<MultiplayerRoom | null> {
        return this.getOne({ channelId: channelId });
    }
}
