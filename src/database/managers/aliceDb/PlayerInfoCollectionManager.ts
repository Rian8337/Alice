import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { DatabasePlayerInfo } from "@alice-interfaces/database/aliceDb/DatabasePlayerInfo";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Snowflake, User } from "discord.js";
import { FindOptions } from "mongodb";

/**
 * A manager for the `playerinfo` collection.
 */
export class PlayerInfoCollectionManager extends DatabaseCollectionManager<
    DatabasePlayerInfo,
    PlayerInfo
> {
    protected override readonly utilityInstance: new (
        data: DatabasePlayerInfo
    ) => PlayerInfo = PlayerInfo;

    override get defaultDocument(): DatabasePlayerInfo {
        return {
            alicecoins: 0,
            challenges: [],
            discordid: "",
            hasClaimedDaily: false,
            hasSubmittedMapShare: false,
            isBannedFromMapShare: false,
            picture_config: {
                badges: [],
                activeBadges: [],
                activeBackground: {
                    id: "bg",
                    name: "Default",
                },
                backgrounds: [],
                bgColor: "#008BFF",
                textColor: "#000000",
            },
            points: 0,
            streak: 0,
            transferred: 0,
            uid: 0,
            username: "",
        };
    }

    /**
     * Gets a Discord user's info with respect to bot-related features
     * using its binded uid.
     *
     * @param uid The uid of the binded osu!droid account.
     * @param options Options for the retrieval of the user info.
     */
    getFromUid(
        uid: number,
        options?: FindOptions<DatabasePlayerInfo>
    ): Promise<PlayerInfo | null> {
        return this.getOne({ uid: uid }, options);
    }

    /**
     * Gets a Discord user's info with respect to bot-related features
     * using its binded username.
     *
     * @param username The username of the binded osu!droid account.
     * @param options Options for the retrieval of the user info.
     */
    getFromUsername(
        username: string,
        options?: FindOptions<DatabasePlayerInfo>
    ): Promise<PlayerInfo | null> {
        return this.getOne({ username: username }, options);
    }

    /**
     * Gets a Discord user's info with respect to bot-related features.
     *
     * @param id The ID of the user.
     * @param options Options for the retrieval of the user info.
     */
    getFromUser(
        id: Snowflake,
        options?: FindOptions<DatabasePlayerInfo>
    ): Promise<PlayerInfo | null>;

    /**
     * Gets a Discord user's info with respect to bot-related features.
     *
     * @param user The Discord user.
     * @param options Options for the retrieval of the user info.
     */
    getFromUser(
        user: User,
        options?: FindOptions<DatabasePlayerInfo>
    ): Promise<PlayerInfo | null>;

    getFromUser(
        userOrId: Snowflake | User,
        options?: FindOptions<DatabasePlayerInfo>
    ): Promise<PlayerInfo | null> {
        return this.getOne(
            {
                discordid: userOrId instanceof User ? userOrId.id : userOrId,
            },
            options
        );
    }

    protected override processFindOptions(
        options?: FindOptions<DatabasePlayerInfo>
    ): FindOptions<DatabasePlayerInfo> | undefined {
        if (options?.projection) {
            options.projection.discordid = 1;
        }

        return options;
    }
}
