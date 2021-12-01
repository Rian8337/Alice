import { BaseDocument } from "../BaseDocument";

/**
 * Represents a Discord user's lounge lock.
 */
export interface DatabaseLoungeLock extends BaseDocument {
    /**
     * The ID of the user.
     */
    discordid: string;

    /**
     * The reason the user was locked.
     *
     * In old locks, this doesn't exist.
     */
    reason?: string;

    /**
     * The epoch time at which the lock will expire, in milliseconds.
     *
     * In old locks, the user is locked permanently until the lock is
     * taken out.
     */
    expiration?: number;
}
