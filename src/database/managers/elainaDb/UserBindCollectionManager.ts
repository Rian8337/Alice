import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseUserBind } from "structures/database/elainaDb/DatabaseUserBind";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Filter, FindOptions, WithId } from "mongodb";
import {
    ApplicationCommandOptionChoiceData,
    Collection as DiscordCollection,
    Snowflake,
    User,
} from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { OperationResult } from "@alice-structures/core/OperationResult";

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
            weightedAccuracy: 0,
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
        amount: number,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<DiscordCollection<Snowflake, UserBind>> {
        const userBind: DatabaseUserBind[] = await this.collection
            .find(
                { dppScanComplete: { $ne: true } },
                this.processFindOptions(options)
            )
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
     * @param amount The amount of players to retrieve.
     * @param options Options for the retrieval.
     * @returns The players.
     */
    async getRecalcUnscannedPlayers(
        amount: 1,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<UserBind | null>;

    /**
     * Gets unscanned players based on the given amount.
     *
     * @param amount The amount of players to retrieve.
     * @param options Options for the retrieval.
     * @returns The players.
     */
    async getRecalcUnscannedPlayers(
        amount: Exclude<number, 1>,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<DiscordCollection<Snowflake, UserBind>>;

    async getRecalcUnscannedPlayers(
        amount: number,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<DiscordCollection<Snowflake, UserBind> | UserBind | null> {
        const userBind: DatabaseUserBind[] = await this.collection
            .find(
                { dppRecalcComplete: { $ne: true } },
                this.processFindOptions(options)
            )
            .sort({ pptotal: -1 })
            .limit(amount)
            .toArray();

        if (amount === 1) {
            return userBind.length > 0 ? new UserBind(userBind[0]) : null;
        }

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
        options?: FindOptions<DatabaseUserBind>
    ): Promise<UserBind | null>;

    /**
     * Gets the bind information of a Discord user.
     *
     * @param userId The ID of the user.
     * @param options Options for the retrieval of the bind information.
     */
    getFromUser(
        userId: Snowflake,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<UserBind | null>;

    getFromUser(
        userOrId: User | Snowflake,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<UserBind | null> {
        if (userOrId instanceof User && userOrId.bot) {
            return Promise.resolve(null);
        }

        return this.getOne(
            {
                discordid: userOrId instanceof User ? userOrId.id : userOrId,
            },
            options
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
        options?: FindOptions<DatabaseUserBind>
    ): Promise<UserBind | null> {
        return this.getOne({ previous_bind: { $all: [uid] } }, options);
    }

    /**
     * Gets the bind information of an osu!droid account from its username.
     *
     * @param username The username of the osu!droid account.
     * @param options Options for the retrieval of the bind information.
     */
    getFromUsername(
        username: string,
        options?: FindOptions<DatabaseUserBind>
    ): Promise<UserBind | null> {
        return this.getOne({ username: username }, options);
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
            .find(
                query,
                this.processFindOptions({
                    projection: {
                        _id: 0,
                        discordid: 1,
                        uid: 1,
                        pptotal: 1,
                        playc: 1,
                        username: 1,
                    },
                })
            )
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
        return !!(await this.getFromUser(
            // Need to do this otherwise TypeScript complains
            userOrId instanceof User ? userOrId.id : userOrId,
            {
                projection: {
                    _id: 0,
                },
            }
        ));
    }

    /**
     * Searches players based on username for autocomplete response.
     *
     * @param searchQuery The username to search.
     * @param amount The maximum amount of usernames to return. Defaults to 25.
     * @returns The usernames that match the query.
     */
    async searchPlayersForAutocomplete(
        searchQuery: string | RegExp,
        amount: number = 25
    ): Promise<ApplicationCommandOptionChoiceData<string>[]> {
        let regExp: RegExp;

        try {
            regExp = new RegExp(searchQuery, "i");
        } catch {
            return [];
        }

        const result: DatabaseUserBind[] = await this.collection
            .find({ username: regExp }, { projection: { _id: 0, username: 1 } })
            .limit(amount)
            .toArray();

        return result.map((v) => {
            return {
                name: v.username,
                value: v.username,
            };
        });
    }

    /**
     * Updates the role connection metadata of users.
     */
    async updateRoleConnectionMetadata(): Promise<OperationResult> {
        const users: DatabaseUserBind[] = await this.collection
            .find(
                {
                    dailyRoleMetadataUpdateComplete: { $ne: true },
                },
                this.processFindOptions({
                    projection: {
                        _id: 0,
                        discordid: 1,
                    },
                })
            )
            .toArray();

        for (const user of users) {
            await new UserBind(user).updateRoleMetadata();
        }

        return this.updateMany(
            {},
            { $unset: { dailyRoleMetadataUpdateComplete: "" } }
        );
    }

    protected override processFindOptions(
        options?: FindOptions<DatabaseUserBind>
    ): FindOptions<DatabaseUserBind> | undefined {
        if (options?.projection) {
            options.projection.discordid = 1;
        }

        return super.processFindOptions(options);
    }
}
