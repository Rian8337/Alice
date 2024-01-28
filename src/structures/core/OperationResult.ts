import { If } from "discord.js";

/**
 * Represents the result of an operation.
 */
export interface OperationResult<TSuccess extends boolean = boolean> {
    /**
     * Whether this operation was successful.
     */
    readonly success: TSuccess;

    /**
     * The reason for why this operation failed.
     */
    readonly reason: If<TSuccess, undefined, string>;

    /**
     * Whether this operation was successful.
     *
     * This method provides type narrowing.
     */
    isSuccessful(): this is OperationResult<true>;

    /**
     * Whether this operation failed.
     *
     * This method provides type narrowing.
     */
    failed(): this is OperationResult<false>;
}
