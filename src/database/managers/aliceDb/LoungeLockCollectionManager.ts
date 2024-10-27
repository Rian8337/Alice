import { DatabaseCollectionManager } from "@database/managers/DatabaseCollectionManager";
import { LoungeLock } from "@database/utils/aliceDb/LoungeLock";
import { DatabaseLoungeLock } from "structures/database/aliceDb/DatabaseLoungeLock";
import { OperationResult } from "structures/core/OperationResult";
import { Snowflake } from "discord.js";

/**
 * A manager for the `loungelock` collection.
 */
export class LoungeLockCollectionManager extends DatabaseCollectionManager<
    DatabaseLoungeLock,
    LoungeLock
> {
    protected override readonly utilityInstance: new (
        data: DatabaseLoungeLock,
    ) => LoungeLock = LoungeLock;

    override get defaultDocument(): DatabaseLoungeLock {
        return {
            discordid: "",
            expiration: Number.POSITIVE_INFINITY,
            reason: "",
        };
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
        reason: string,
    ): Promise<OperationResult> {
        return this.insert({
            discordid: userId,
            expiration: Date.now() + duration * 1000,
            reason: reason,
        });
    }
}
