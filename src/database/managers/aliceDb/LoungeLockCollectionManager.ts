import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";
import { DatabaseLoungeLock } from "@alice-interfaces/database/aliceDb/DatabaseLoungeLock";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `loungelock` collection.
 */
export class LoungeLockCollectionManager extends DatabaseCollectionManager<
    DatabaseLoungeLock,
    LoungeLock
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseLoungeLock,
        LoungeLock
    >;

    override get defaultDocument(): DatabaseLoungeLock {
        return {
            discordid: "",
            expiration: Number.POSITIVE_INFINITY,
            reason: "",
        };
    }

    constructor(collection: MongoDBCollection<DatabaseLoungeLock>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseLoungeLock, LoungeLock>
        >new LoungeLock().constructor;
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
     * @param duration The duration of the lock, in seconds.
     * @param reason Reason for locking the user.
     * @returns An object containing information about the operation.
     */
    insertNewLock(
        userId: Snowflake,
        duration: number,
        reason: string
    ): Promise<OperationResult> {
        return this.insert({
            discordid: userId,
            expiration: Date.now() + duration * 1000,
            reason: reason,
        });
    }
}
