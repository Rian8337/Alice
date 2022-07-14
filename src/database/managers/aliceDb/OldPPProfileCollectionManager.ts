import { OldPPProfile } from "@alice-database/utils/aliceDb/OldPPProfile";
import { DatabaseOldPPProfile } from "@alice-structures/database/aliceDb/DatabaseOldPPProfile";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { User, Snowflake, Collection } from "discord.js";
import { FindOptions } from "mongodb";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `playeroldpp` collection.
 */
export class OldPPProfileCollectionManager extends DatabaseCollectionManager<
    DatabaseOldPPProfile,
    OldPPProfile
> {
    protected override readonly utilityInstance: new (
        data: DatabaseOldPPProfile
    ) => OldPPProfile = OldPPProfile;

    override get defaultDocument(): DatabaseOldPPProfile {
        return {
            discordId: "",
            uid: 0,
            username: "",
            playc: 0,
            pptotal: 0,
            weightedAccuracy: 0,
            pp: [],
            previous_bind: [],
        };
    }

    /**
     * Gets the old pp profile of a Discord user.
     *
     * @param user The user.
     * @param options Options for the retrieval of the old pp profile.
     */
    getFromUser(
        user: User,
        options?: FindOptions<DatabaseOldPPProfile>
    ): Promise<OldPPProfile | null>;

    /**
     * Gets the old pp profile of a Discord user.
     *
     * @param userId The ID of the user.
     * @param options Options for the retrieval of the old pp profile.
     */
    getFromUser(
        userId: Snowflake,
        options?: FindOptions<DatabaseOldPPProfile>
    ): Promise<OldPPProfile | null>;

    getFromUser(
        userOrId: User | Snowflake,
        options?: FindOptions<DatabaseOldPPProfile>
    ): Promise<OldPPProfile | null> {
        if (userOrId instanceof User && userOrId.bot) {
            return Promise.resolve(null);
        }

        return this.getOne(
            {
                discordId: userOrId instanceof User ? userOrId.id : userOrId,
            },
            options
        );
    }

    /**
     * Gets the old pp profile of an osu!droid account from its uid.
     *
     * @param uid The uid of the osu!droid account.
     * @param options Options for the retrieval of the old pp profile.
     */
    getFromUid(
        uid: number,
        options?: FindOptions<DatabaseOldPPProfile>
    ): Promise<OldPPProfile | null> {
        return this.getOne({ previous_bind: { $all: [uid] } }, options);
    }

    /**
     * Gets the old pp profile of an osu!droid account from its username.
     *
     * @param username The username of the osu!droid account.
     * @param options Options for the retrieval of the old pp profile.
     */
    getFromUsername(
        username: string,
        options?: FindOptions<DatabaseOldPPProfile>
    ): Promise<OldPPProfile | null> {
        return this.getOne({ username: username }, options);
    }

    /**
     * Gets the DPP leaderboard.
     *
     * @returns The leaderboard, mapped by the player's Discord ID.
     */
    async getLeaderboard(): Promise<Collection<string, OldPPProfile>> {
        const res: DatabaseOldPPProfile[] = await this.collection
            .find(
                {},
                this.processFindOptions({
                    projection: {
                        _id: 0,
                        discordId: 1,
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
            res.map((v) => new OldPPProfile(v)),
            "discordId"
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

    protected override processFindOptions(
        options?: FindOptions<DatabaseOldPPProfile>
    ): FindOptions<DatabaseOldPPProfile> | undefined {
        if (options?.projection) {
            options.projection.discordid = 1;
        }

        return super.processFindOptions(options);
    }
}
