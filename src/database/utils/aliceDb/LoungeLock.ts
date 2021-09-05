import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseLoungeLock } from "@alice-interfaces/database/aliceDb/DatabaseLoungeLock";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a Discord user's lounge lock.
 */
export class LoungeLock extends Manager implements DatabaseLoungeLock {
    discordid: Snowflake;
    reason?: string;
    expiration: number;
    readonly _id?: ObjectId;

    /**
     * Whether this lock is expired.
     */
    get isExpired(): boolean {
        return this.expiration < Date.now();
    }

    constructor(data: DatabaseLoungeLock = DatabaseManager.aliceDb.collections.loungeLock.defaultDocument) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.reason = data.reason;
        this.expiration = data.expiration ?? Number.POSITIVE_INFINITY;
    }

    /**
     * Extends this lock.
     * 
     * @param duration The duration to extend for, in seconds.
     * @param reason The reason for extending the reason.
     * @returns An object containing information about the database operation.
     */
    async extend(duration: number, reason?: string): Promise<DatabaseOperationResult> {
        this.expiration += duration;
        this.reason = reason;

        return DatabaseManager.aliceDb.collections.loungeLock.update(
            { discordid: this.discordid },
            { $set: { expiration: this.expiration, reason: this.reason } }
        );
    }

    /**
     * Releases this lock.
     * 
     * @returns An object containing information about the database operation.
     */
    async unlock(): Promise<DatabaseOperationResult> {
        return DatabaseManager.aliceDb.collections.loungeLock.delete({ discordid: this.discordid });
    }

    /**
     * Makes this lock permanent.
     * 
     * @returns An object containing information about the database operation.
     */
    async makePermanent(): Promise<DatabaseOperationResult> {
        this.expiration = Number.POSITIVE_INFINITY;

        return DatabaseManager.aliceDb.collections.loungeLock.update(
            { discordid: this.discordid },
            { $set: { expiration: this.expiration } }
        );
    }
}