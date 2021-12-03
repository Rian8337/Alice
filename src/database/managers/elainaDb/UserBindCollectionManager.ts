import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { DatabaseUserBind } from "@alice-interfaces/database/elainaDb/DatabaseUserBind";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection, Filter, WithId } from "mongodb";
import { Collection as DiscordCollection, Snowflake, User } from "discord.js";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `userbind` collection.
 */
export class UserBindCollectionManager extends DatabaseCollectionManager<
    DatabaseUserBind,
    UserBind
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseUserBind,
        UserBind
    >;

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
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseUserBind>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseUserBind, UserBind>
            >new UserBind().constructor;
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
     * @param amount The amount of unscanned players to retrieve.
     * @returns The players.
     */
    async getRecalcUnscannedPlayers(
        amount: number
    ): Promise<DiscordCollection<Snowflake, UserBind>> {
        const userBind: DatabaseUserBind[] = await this.collection
            .find({ dppRecalcComplete: { $ne: true } })
            .sort({ pptotal: -1 })
            .limit(amount)
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
     */
    getFromUser(user: User): Promise<UserBind | null>;

    /**
     * Gets the bind information of a Discord user.
     *
     * @param userId The ID of the user.
     */
    getFromUser(userId: Snowflake): Promise<UserBind | null>;

    getFromUser(userOrId: User | Snowflake): Promise<UserBind | null> {
        return this.getOne({
            discordid: userOrId instanceof User ? userOrId.id : userOrId,
        });
    }

    /**
     * Gets the bind information of an osu!droid account from its uid.
     *
     * @param uid The uid of the osu!droid account.
     */
    getFromUid(uid: number): Promise<UserBind | null> {
        return this.getOne({ previous_bind: { $all: [uid] } });
    }

    /**
     * Gets the bind information of an osu!droid account from its username.
     *
     * @param username The username of the osu!droid account.
     */
    getFromUsername(username: string): Promise<UserBind | null> {
        return this.getOne({ username: username });
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
}
