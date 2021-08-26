import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";
import { DatabaseLoungeLock } from "@alice-interfaces/database/aliceDb/DatabaseLoungeLock";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `loungelock` collection.
 */
export class LoungeLockCollectionManager extends DatabaseCollectionManager<DatabaseLoungeLock, LoungeLock> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseLoungeLock, LoungeLock>;

    get defaultDocument(): DatabaseLoungeLock {
        return {
            discordid: "",
            expiration: Number.POSITIVE_INFINITY,
            reason: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseLoungeLock>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseLoungeLock, LoungeLock>> new LoungeLock(client, this.defaultDocument).constructor
    }

    /**
     * Gets a user's lounge lock information.
     * 
     * @param userId The ID of the user.
     * @returns The lock information, `null` if not found.
     */
    getUserLockInfo(userId: Snowflake): Promise<LoungeLock | null> {
        return this.getOne({ discordid: userId });
    }

    /**
     * Inserts a new lounge lock.
     * 
     * @param userId The ID of the user to lock.
     * @param duration The duration of the lock.
     * @param reason Reason for locking the user.
     * @returns An object containing information about the operation.
     */
    insertNewLock(userId: Snowflake, duration: number, reason: string): Promise<DatabaseOperationResult> {
        return this.insert({
            discordid: userId,
            expiration: Math.floor(Date.now()) + duration,
            reason: reason
        });
    }
}