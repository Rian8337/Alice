import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseUserBind } from "@alice-interfaces/database/elainaDb/DatabaseUserBind";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Filter, FindOptions, WithId } from "mongodb";
import { Collection as DiscordCollection, Snowflake, User } from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `userbind` collection.
 */
export class UserBindCollectionManager extends DatabaseCollectionManager<
    DatabaseUserBind,
    UserBind
> {
    protected override readonly utilityInstance: new (
        data: DatabaseUserBind
    ) => UserBind = UserBind;

    override get defaultDocument(): DatabaseUserBind {
        return {
            discordid: "",
            hasAskedForRecalc: false,
            playc: 0,
            pp: [],
            pptotal: 0,
            previous_bind: [],
            uid: 0,
            username: "",
        };
    }

    /**
     * Gets the dpp rank of a specified dpp value.
     *
     * @param totalPP The total PP.
     */
    async getUserDPPRank(totalPP: number): Promise<number> {
        return (
            (await this.collection.countDocuments({
                pptotal: { $gt: totalPP },
            })) + 1
        );
    }

    /**
     * Gets unscanned players based on the given amount.
     *
     * @param amount The amount of unscanned players to retrieve.
     * @returns The players.
     */
    async getDPPUnscannedPlayers(
        amount: number
    ): Promise<DiscordCollection<Snowflake, UserBind>> {
        const userBind: DatabaseUserBind[] = await this.collection
            .find({ dppScanComplete: { $ne: true } })
            .sort({ pptotal: -1 })
            .limit(amount)
            .toArray();

        return ArrayHelper.arrayToCollection(
            userBind.map((v) => new UserBind(v)),
            "discordid"
        );
    }

    /**
     * Gets unscanned players based on the given amount.
     *
     * @param options Options for the retrieval.
     * @returns The players.
     */
    async getRecalcUnscannedPlayers(options: {
        /**
         * The amount of players to retrieve.
         */
        amount: number;

        /**
         * Whether to retrieve pp plays from them.
         */
        retrieveAllPlays?: boolean;
    }): Promise<DiscordCollection<Snowflake, UserBind>> {
        const dbOptions: FindOptions<DatabaseUserBind> = {};

        if (options.retrieveAllPlays === false) {
            dbOptions.projection ??= {};
            dbOptions.projection.pp = 0;
        }

        const userBind: DatabaseUserBind[] = await this.collection
            .find({ dppRecalcComplete: { $ne: true } }, dbOptions)
            .sort({ pptotal: -1 })
            .limit(options.amount)
            .toArray();

        return ArrayHelper.arrayToCollection(
            userBind.map((v) => new UserBind(v)),
            "discordid"
        );
    }

    /**
     * Gets the amount of players that have not been recalculated in a droid performance points (dpp) recalculation.
     */
    async getRecalcUncalculatedPlayerCount(): Promise<number> {
        return this.collection.countDocuments({
            dppRecalcComplete: { $ne: true },
        });
    }

    /**
     * Gets the amount of players that have been recalculated in a droid performance points (dpp) recalculation.
     */
    async getRecalcCalculatedPlayerCount(): Promise<number> {
        return this.collection.countDocuments({ dppRecalcComplete: true });
    }

    /**
     * Gets the bind information of a Discord user.
     *
     * @param user The user.
     * @param options Options for the retrieval of the bind information.
     */
    getFromUser(
        user: User,
        options?: {
            /**
             * Whether to include pp plays in the bind information.
             */
            retrieveAllPlays: boolean;
        }
    ): Promise<UserBind | null>;

    /**
     * Gets the bind information of a Discord user.
     *
     * @param userId The ID of the user.
     * @param options Options for the retrieval of the bind information.
     */
    getFromUser(
        userId: Snowflake,
        options?: {
            /**
             * Whether to include pp plays in the bind information.
             */
            retrieveAllPlays: boolean;
        }
    ): Promise<UserBind | null>;

    getFromUser(
        userOrId: User | Snowflake,
        options?: {
            /**
             * Whether to include pp plays in the bind information.
             */
            retrieveAllPlays: boolean;
        }
    ): Promise<UserBind | null> {
        if (userOrId instanceof User && userOrId.bot) {
            return Promise.resolve(null);
        }

        const dbOptions: FindOptions<DatabaseUserBind> = {};

        if (options?.retrieveAllPlays === false) {
            dbOptions.projection ??= {};
            dbOptions.projection.pp = 0;
        }

        return this.getOne(
            {
                discordid: userOrId instanceof User ? userOrId.id : userOrId,
            },
            dbOptions
        );
    }

    /**
     * Gets the bind information of an osu!droid account from its uid.
     *
     * @param uid The uid of the osu!droid account.
     * @param options Options for the retrieval of the bind information.
     */
    getFromUid(
        uid: number,
        options?: {
            /**
             * Whether to include pp plays in the bind information.
             */
            retrieveAllPlays: boolean;
        }
    ): Promise<UserBind | null> {
        const dbOptions: FindOptions<DatabaseUserBind> = {};

        if (options?.retrieveAllPlays === false) {
            dbOptions.projection ??= {};
            dbOptions.projection.pp = 0;
        }

        return this.getOne({ previous_bind: { $all: [uid] } }, dbOptions);
    }

    /**
     * Gets the bind information of an osu!droid account from its username.
     *
     * @param username The username of the osu!droid account.
     * @param options Options for the retrieval of the bind information.
     */
    getFromUsername(
        username: string,
        options?: {
            /**
             * Whether to include pp plays in the bind information.
             */
            retrieveAllPlays: boolean;
        }
    ): Promise<UserBind | null> {
        const dbOptions: FindOptions<DatabaseUserBind> = {};

        if (options?.retrieveAllPlays === false) {
            dbOptions.projection ??= {};
            dbOptions.projection.pp = 0;
        }

        return this.getOne({ username: username }, dbOptions);
    }

    /**
     * Gets the DPP leaderboard.
     *
     * @param clan The clan to get the leaderboard for.
     */
    async getDPPLeaderboard(
        clan?: string
    ): Promise<DiscordCollection<string, UserBind>> {
        const query: Filter<WithId<DatabaseUserBind>> = {};

        if (clan) {
            query.clan = clan;
        }

        const userBind: DatabaseUserBind[] = await this.collection
            .find(query, {
                projection: {
                    _id: 0,
                    discordid: 1,
                    uid: 1,
                    pptotal: 1,
                    playc: 1,
                    username: 1,
                },
            })
            .sort({ pptotal: -1 })
            .toArray();

        return ArrayHelper.arrayToCollection(
            userBind.map((v) => new UserBind(v)),
            "discordid"
        );
    }

    /**
     * Checks whether a Discord user is binded.
     *
     * @param user The user.
     */
    async isUserBinded(user: User): Promise<boolean>;

    /**
     * Checks whether a Discord user is binded.
     *
     * @param userId The ID of the user.
     */
    async isUserBinded(userId: Snowflake): Promise<boolean>;

    async isUserBinded(userOrId: User | Snowflake): Promise<boolean> {
        return (
            (await this.collection.countDocuments({
                discordid: userOrId instanceof User ? userOrId.id : userOrId,
            })) > 0
        );
    }
}
