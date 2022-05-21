import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { DatabaseClan } from "@alice-interfaces/database/elainaDb/DatabaseClan";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as DiscordCollection } from "discord.js";
import { Snowflake, User } from "discord.js";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

/**
 * A manager for the `clan` collection.
 */
export class ClanCollectionManager extends DatabaseCollectionManager<
    DatabaseClan,
    Clan
> {
    protected override readonly utilityInstance: new (
        data: DatabaseClan
    ) => Clan = Clan;

    override get defaultDocument(): DatabaseClan {
        const currentTime: number = Math.floor(Date.now() / 1000);

        return {
            active_powerups: [],
            bannerMessage: "",
            bannerURL: "",
            bannercooldown: currentTime,
            createdAt: currentTime,
            description: "",
            iconMessage: "",
            iconURL: "",
            iconcooldown: currentTime,
            isMatch: false,
            leader: "",
            member_list: [],
            name: "",
            namecooldown: currentTime,
            power: 0,
            powerups: [
                {
                    name: "megabuff",
                    amount: 0,
                },
                {
                    name: "megadebuff",
                    amount: 0,
                },
                {
                    name: "megachallenge",
                    amount: 0,
                },
                {
                    name: "megabomb",
                    amount: 0,
                },
                {
                    name: "superbuff",
                    amount: 0,
                },
                {
                    name: "superdebuff",
                    amount: 0,
                },
                {
                    name: "superchallenge",
                    amount: 0,
                },
                {
                    name: "superbomb",
                    amount: 0,
                },
                {
                    name: "buff",
                    amount: 0,
                },
                {
                    name: "debuff",
                    amount: 0,
                },
                {
                    name: "challenge",
                    amount: 0,
                },
                {
                    name: "bomb",
                    amount: 0,
                },
            ],
            roleColorUnlocked: false,
            roleIconUnlocked: false,
            weeklyfee: currentTime + 86400 * 7, // Weekly upkeep every week
        };
    }

    /**
     * Gets the clan of a user.
     *
     * @param user The user to get the clan from.
     * @returns The user's clan, `null` if not found.
     */
    getFromUser(user: User): Promise<Clan | null>;

    /**
     * Gets the clan of a user.
     *
     * @param userID The ID of the user to get the clan from.
     * @returns The user's clan, `null` if not found.
     */
    getFromUser(userId: Snowflake): Promise<Clan | null>;

    getFromUser(userOrId: User | Snowflake): Promise<Clan | null> {
        return this.getOne({
            "member_list.id": userOrId instanceof User ? userOrId.id : userOrId,
        });
    }

    /**
     * Gets a clan from its name.
     *
     * @param name The name of the clan.
     * @returns The clan, `null` if not found.
     */
    getFromName(name: string): Promise<Clan | null> {
        return this.getOne({ name: name });
    }

    /**
     * Gets clans that are due to weekly fee within the specified time limit.
     *
     * @param weeklyFeeTimeLimit The time limit.
     */
    async getClansDueToWeeklyFee(
        weeklyFeeTimeLimit: number
    ): Promise<DiscordCollection<string, Clan>> {
        const databaseClans: DatabaseClan[] = await this.collection
            .find({ weeklyfee: { $lte: weeklyFeeTimeLimit } })
            .sort({ weeklyfee: 1 })
            .toArray();

        return ArrayHelper.arrayToCollection(
            databaseClans.map((v) => new Clan(v)),
            "name"
        );
    }
}
