import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseWarning } from "structures/database/aliceDb/DatabaseWarning";
import { Manager } from "@utils/base/Manager";
import { Snowflake } from "discord.js";
import { ObjectId } from "mongodb";

/**
 * Represents a user's warning.
 */
export class Warning extends Manager implements DatabaseWarning {
    globalId: string;
    discordId: Snowflake;
    guildId: Snowflake;
    channelId: Snowflake;
    issuerId: Snowflake;
    creationDate: number;
    expirationDate: number;
    points: number;
    reason: string;
    readonly _id?: ObjectId;

    /**
     * The guild-specific ID of this warning.
     */
    get guildSpecificId(): number {
        return parseInt(this.globalId.split("-")[1]);
    }

    /**
     * Whether this warning is still active (not expired).
     */
    get isActive(): boolean {
        return this.expirationDate * 1000 > Date.now();
    }

    /**
     * The duration at which this warning is active for, in seconds.
     */
    get overallDuration(): number {
        return this.expirationDate - this.creationDate;
    }

    /**
     * The amount of seconds until this warning will expire.
     */
    get activeDuration(): number {
        return Math.max(0, this.expirationDate - Math.floor(Date.now() / 1000));
    }
    constructor(
        data: DatabaseWarning = DatabaseManager.aliceDb?.collections.userWarning
            .defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.globalId = data.globalId;
        this.discordId = data.discordId;
        this.guildId = data.guildId;
        this.channelId = data.channelId;
        this.issuerId = data.issuerId;
        this.creationDate = data.creationDate;
        this.expirationDate = data.expirationDate;
        this.points = data.points;
        this.reason = data.reason;
    }
}
