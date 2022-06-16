import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { DatabasePlayerInfo } from "@alice-interfaces/database/aliceDb/DatabasePlayerInfo";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Snowflake, User } from "discord.js";
import { FindOptions } from "mongodb";

interface PlayerInfoRetrieveOption {
    /**
     * Whether to include challenge data in the user info. Defaults to `false`.
     */
    retrieveChallengeData?: boolean;

    /**
     * Whether to include badge data in the user info. Defaults to `false`.
     */
    retrieveBadges?: boolean;

    /**
     * Whether to include active badge data in the user info. Defaults to `false`.
     */
    retrieveActiveBadges?: boolean;

    /**
     * Whether to include background data in the user info. Defaults to `false`.
     */
    retrieveBackgrounds?: boolean;
}

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
        options?: PlayerInfoRetrieveOption
    ): Promise<PlayerInfo | null> {
        return this.getOne({ uid: uid }, this.getDbOptions(options));
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
        options?: PlayerInfoRetrieveOption
    ): Promise<PlayerInfo | null> {
        return this.getOne({ username: username }, this.getDbOptions(options));
    }

    /**
     * Gets a Discord user's info with respect to bot-related features.
     *
     * @param id The ID of the user.
     * @param options Options for the retrieval of the user info.
     */
    getFromUser(
        id: Snowflake,
        options?: PlayerInfoRetrieveOption
    ): Promise<PlayerInfo | null>;

    /**
     * Gets a Discord user's info with respect to bot-related features.
     *
     * @param user The Discord user.
     * @param options Options for the retrieval of the user info.
     */
    getFromUser(
        user: User,
        options?: PlayerInfoRetrieveOption
    ): Promise<PlayerInfo | null>;

    getFromUser(
        userOrId: Snowflake | User,
        options?: PlayerInfoRetrieveOption
    ): Promise<PlayerInfo | null> {
        return this.getOne(
            {
                discordid: userOrId instanceof User ? userOrId.id : userOrId,
            },
            this.getDbOptions(options)
        );
    }

    /**
     * Gets database options for retrieving user information.
     *
     * @param options The options to parse.
     */
    private getDbOptions(
        options?: PlayerInfoRetrieveOption
    ): FindOptions<DatabasePlayerInfo> {
        const dbOptions: FindOptions<DatabasePlayerInfo> = {};

        if (options) {
            dbOptions.projection ??= {};

            if (!options.retrieveActiveBadges) {
                dbOptions.projection["picture_config.activeBadges"] = 0;
            }

            if (!options.retrieveBackgrounds) {
                dbOptions.projection["picture_config.backgrounds"] = 0;
            }

            if (!options.retrieveBadges) {
                dbOptions.projection["picture_config.badges"] = 0;
            }

            if (!options.retrieveChallengeData) {
                dbOptions.projection.challenges = 0;
            }
        }

        return dbOptions;
    }
}
