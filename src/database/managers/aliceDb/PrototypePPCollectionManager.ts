import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { DatabasePrototypePP } from "structures/database/aliceDb/DatabasePrototypePP";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import {
    ApplicationCommandOptionChoiceData,
    Collection as DiscordCollection,
    Snowflake,
    User,
} from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `prototypepp` collection.
 */
export class PrototypePPCollectionManager extends DatabaseCollectionManager<
    DatabasePrototypePP,
    PrototypePP
> {
    protected override readonly utilityInstance: new (
        data: DatabasePrototypePP,
    ) => PrototypePP = PrototypePP;
    override get defaultDocument(): DatabasePrototypePP {
        return {
            discordid: "",
            lastUpdate: Date.now(),
            playc: 0,
            pp: [],
            pptotal: 0,
            prevpptotal: 0,
            uid: 0,
            username: "",
            scanDone: true,
            previous_bind: [],
        };
    }

    /**
     * Gets the prototype droid performance points (dpp) information of a Discord user.
     *
     * @param user The user.
     */
    getFromUser(user: User): Promise<PrototypePP | null>;

    /**
     * Gets the prototype droid performance points (dpp) information of a Discord user.
     *
     * @param userId The ID of the user.
     */
    getFromUser(userId: Snowflake): Promise<PrototypePP | null>;

    getFromUser(userOrId: User | Snowflake): Promise<PrototypePP | null> {
        return this.getOne(
            {
                discordid: userOrId instanceof User ? userOrId.id : userOrId,
            },
            {
                projection: {
                    "pp.cursorIndexes": 0,
                },
            },
        );
    }

    /**
     * Gets the prototype droid performance points (dpp) information of an osu!droid account from its uid.
     *
     * @param uid The uid of the osu!droid account.
     */
    getFromUid(uid: number): Promise<PrototypePP | null> {
        return this.getOne(
            { previous_bind: { $all: [uid] } },
            {
                projection: {
                    "pp.cursorIndexes": 0,
                },
            },
        );
    }

    /**
     * Gets the prototype droid performance points (dpp) information of an osu!droid account from its username.
     *
     * @param username The username of the osu!droid account.
     */
    getFromUsername(username: string): Promise<PrototypePP | null> {
        return this.getOne(
            { username: username },
            {
                projection: {
                    "pp.cursorIndexes": 0,
                },
            },
        );
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
     * Gets the DPP leaderboard.
     *
     * @returns The leaderboard, mapped by the player's Discord ID.
     */
    async getLeaderboard(): Promise<DiscordCollection<Snowflake, PrototypePP>> {
        const prototypeEntries: DatabasePrototypePP[] = await this.collection
            .find(
                {},
                {
                    projection: {
                        _id: 0,
                        discordid: 1,
                        uid: 1,
                        pptotal: 1,
                        playc: 1,
                        username: 1,
                    },
                },
            )
            .sort({ pptotal: -1 })
            .toArray();

        return ArrayHelper.arrayToCollection(
            prototypeEntries.map((v) => new PrototypePP(v)),
            "discordid",
        );
    }

    /**
     * Gets unscanned players based on the given amount.
     *
     * The data returned will only consist of `discordid` and `pptotal`. You should
     * then retrieve player data from bind database to perform recalculation.
     *
     * @param amount The amount of unscanned players to retrieve.
     * @returns The players.
     */
    async getUnscannedPlayers(
        amount: number,
    ): Promise<DiscordCollection<Snowflake, PrototypePP>> {
        const prototypeEntries: DatabasePrototypePP[] = await this.collection
            .find(
                { scanDone: { $ne: true } },
                { projection: { _id: 0, discordid: 1, pptotal: 1 } },
            )
            .sort({ pptotal: -1 })
            .limit(amount)
            .toArray();

        return ArrayHelper.arrayToCollection(
            prototypeEntries.map((v) => new PrototypePP(v)),
            "discordid",
        );
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
        amount: number = 25,
    ): Promise<ApplicationCommandOptionChoiceData<string>[]> {
        const result: DatabasePrototypePP[] = await this.collection
            .find(
                { username: new RegExp(searchQuery, "i") },
                { projection: { _id: 0, username: 1 } },
            )
            .limit(amount)
            .toArray();

        return result.map((v) => {
            return {
                name: v.username,
                value: v.username,
            };
        });
    }
}
