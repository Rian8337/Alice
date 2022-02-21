import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ChallengeCompletionData } from "@alice-interfaces/challenge/ChallengeCompletionData";
import { DatabasePlayerInfo } from "@alice-interfaces/database/aliceDb/DatabasePlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { ObjectId } from "bson";
import { Collection, Snowflake } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { PlayerInfoLocalization } from "@alice-localization/database/utils/aliceDb/PlayerInfoLocalization";
import { Language } from "@alice-localization/base/Language";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

/**
 * Represents an information about a Discord user regarding the bot (amount of Alice coins and its streak, daily/weekly challenges status, profile picture format, etc).
 */
export class PlayerInfo extends Manager {
    /**
     * The username of the osu!droid account binded to the user.
     */
    username: string;

    /**
     * The UID of the osu!droid account binded to the user.
     */
    uid: number;

    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * Information about daily/weekly challenge completions, mapped by challenge ID.
     */
    challenges: Collection<string, ChallengeCompletionData>;

    /**
     * The amount of points the user has from playing daily/weekly challenges.
     */
    points: number;

    /**
     * The amount of Alice coins the user has.
     */
    alicecoins: number;

    /**
     * The amount of daily coins claim streak the user has.
     */
    streak: number;

    /**
     * Configuration for profile image.
     */
    picture_config: ProfileImageConfig;

    /**
     * The epoch time at which daily coins claim will be reset,
     * in seconds.
     *
     * This is only available under user ID `386742340968120321`.
     */
    dailyreset?: number;

    /**
     * Whether the user has submitted a beatmap to share.
     */
    hasSubmittedMapShare: boolean;

    /**
     * Whether the user has claimed daily coins.
     */
    hasClaimedDaily: boolean;

    /**
     * Whether the user is banned from sharing beatmaps in map share.
     */
    isBannedFromMapShare: boolean;

    /**
     * The amount of Alice coins the user has transferred to other user.
     */
    transferred: number;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabasePlayerInfo = DatabaseManager.aliceDb?.collections
            .playerInfo.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.username = data.username;
        this.uid = data.uid;
        this.challenges = ArrayHelper.arrayToCollection(
            data.challenges ?? [],
            "id"
        );
        this.points = data.points;
        this.alicecoins = data.alicecoins;
        this.streak = data.streak;
        this.picture_config = data.picture_config;
        this.dailyreset = data.dailyreset;
        this.hasSubmittedMapShare = data.hasSubmittedMapShare;
        this.hasClaimedDaily = data.hasClaimedDaily;
        this.isBannedFromMapShare = data.isBannedFromMapShare;
        this.transferred = data.transferred;
    }

    /**
     * Increments the user's coins.
     *
     * @param amount The amount to increment.
     * @param language The locale of the user who attempted to increment this user's coins. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async incrementCoins(amount: number, language: Language = "en"): Promise<OperationResult> {
        const localization: PlayerInfoLocalization = this.getLocalization(language);

        if (this.alicecoins + amount < 0) {
            // This would only happen if the amount incremented is negative
            return this.createOperationResult(
                false,
                StringHelper.formatString(
                    localization.getTranslation("tooMuchCoinDeduction"),
                    this.alicecoins.toLocaleString()
                )
            );
        }

        this.alicecoins = Math.max(0, this.alicecoins + amount);

        return DatabaseManager.aliceDb.collections.playerInfo.update(
            { discordid: this.discordid },
            { $set: { alicecoins: this.alicecoins } }
        );
    }

    /**
     * Claims daily coins.
     *
     * @param coinAmount The amount of coins the user has gained.
     * @param language The locale of the user who attempted to claim. Defaults to English.
     */
    async claimDailyCoins(coinAmount: number, language: Language = "en"): Promise<OperationResult> {
        const localization: PlayerInfoLocalization = this.getLocalization(language);

        if (this.hasClaimedDaily) {
            return this.createOperationResult(
                false,
                localization.getTranslation("dailyClaimUsed")
            );
        }

        this.hasClaimedDaily = true;

        this.alicecoins += coinAmount;

        ++this.streak;

        if (this.streak === 5) {
            this.streak = 1;
        }

        return DatabaseManager.aliceDb.collections.playerInfo.update(
            { discordid: this.discordid },
            {
                $inc: {
                    alicecoins: coinAmount,
                },
                $set: {
                    hasClaimedDaily: this.hasClaimedDaily,
                    streak: this.streak,
                },
            }
        );
    }

    /**
     * Transfers this user's coins to another user.
     *
     * @param amount The amount of coins to transfer.
     * @param thisPlayer The `Player` instance of this user.
     * @param to The player to transfer the Alice coins to.
     * @param language The locale of the user who attempted the transfer. Defaults to English.
     * @returns An object containing information about the operation.
     */
    async transferCoins(
        amount: number,
        thisPlayer: Player,
        to: PlayerInfo,
        language: Language = "en"
    ): Promise<OperationResult> {
        const localization: PlayerInfoLocalization = this.getLocalization(language);

        let limit: number;

        switch (true) {
            case thisPlayer.rank < 10:
                limit = 2500;
                break;
            case thisPlayer.rank < 50:
                limit = 1750;
                break;
            case thisPlayer.rank < 100:
                limit = 1250;
                break;
            case thisPlayer.rank < 500:
                limit = 500;
                break;
            default:
                limit = 250;
        }

        if (
            !NumberHelper.isNumberInRange(
                amount + this.transferred,
                0,
                limit,
                true
            )
        ) {
            return this.createOperationResult(
                false,
                StringHelper.formatString(
                    localization.getTranslation("dailyLimitReached"),
                    (limit - this.transferred).toLocaleString()
                )
            );
        }

        await DatabaseManager.aliceDb.collections.playerInfo.update(
            { discordid: this.discordid },
            { $inc: { transferred: amount, alicecoins: -amount } }
        );

        return to.incrementCoins(amount);
    }

    /**
     * Gets the localization of this database utility.
     * 
     * @param language The language to localize.
     */
    private getLocalization(language: Language): PlayerInfoLocalization {
        return new PlayerInfoLocalization(language);
    }
}
