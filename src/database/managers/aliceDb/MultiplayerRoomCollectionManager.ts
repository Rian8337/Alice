import { DatabaseMultiplayerRoom } from "@alice-interfaces/database/aliceDb/DatabaseMultiplayerRoom";
import { MultiplayerRoom } from "../../utils/aliceDb/MultiplayerRoom";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { GuildMember, Snowflake, User } from "discord.js";
import { FindOptions } from "mongodb";

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
            textChannelId: "",
            threadChannelId: "",
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
                modMultipliers: {},
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
     * @param options Options for the retrieval of the multiplayer room.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(
        discordId: Snowflake,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null>;

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param user The player.
     * @param options Options for the retrieval of the multiplayer room.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(
        user: User,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null>;

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param member The player.
     * @param options Options for the retrieval of the multiplayer room.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(
        member: GuildMember,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null>;

    /**
     * Gets a multiplayer room from a participating player.
     *
     * @param uid The uid of the player.
     * @param options Options for the retrieval of the multiplayer room.
     * @returns The multiplayer room, `null` if the player isn't participating in a multiplayer room.
     */
    getFromUser(
        uid: number,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null>;

    getFromUser(
        input: Snowflake | User | GuildMember | number,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null> {
        return this.getOne(
            input instanceof GuildMember || input instanceof User
                ? { "players.discordId": input.id }
                : typeof input === "string"
                ? { "players.discordId": input }
                : { "players.uid": input },
            this.processFindOptions(options)
        );
    }

    /**
     * Gets a multiplayer room from its ID.
     *
     * @param roomId The ID of the multiplayer room.
     * @param options Options for the retrieval of the multiplayer room.
     * @returns The multiplayer room, `null` if there is no multiplayer room with that ID.
     */
    getFromId(
        roomId: string,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null> {
        return this.getOne(
            { roomId: roomId },
            this.processFindOptions(options)
        );
    }

    /**
     * Gets a multiplayer room from its thread channel ID.
     *
     * @param channelId The ID of the thread channel where the multiplayer room resides on.
     * @param options Options for the retrieval of the multiplayer room.
     * @returns The multiplayer room, `null` if there is no multiplayer room with that ID.
     */
    getFromChannel(
        channelId: Snowflake,
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): Promise<MultiplayerRoom | null> {
        return this.getOne(
            { threadChannelId: channelId },
            this.processFindOptions(options)
        );
    }

    /**
     * Checks whether a room ID has been taken.
     *
     * @param roomId The room ID.
     */
    async idIsTaken(roomId: string): Promise<boolean> {
        const room: MultiplayerRoom | null = await this.getOne(
            { roomId: roomId },
            {
                projection: {
                    _id: 1,
                },
            }
        );

        return room !== null;
    }

    protected override processFindOptions(
        options?: FindOptions<DatabaseMultiplayerRoom>
    ): FindOptions<DatabaseMultiplayerRoom> | undefined {
        if (options?.projection) {
            options.projection.roomId = 1;
        }

        return super.processFindOptions(options);
    }
}
