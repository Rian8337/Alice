import { Bot } from "@alice-core/Bot";
import { OperationResult } from "structures/core/OperationResult";

/**
 * The base of all managers.
 */
export abstract class Manager {
    /**
     * The client that instantiated this manager.
     */
    protected static client: Bot;

    /**
     * The client that instantiated this manager.
     */
    protected readonly client: Bot = Manager.client;

    protected isInitialized: boolean = false;

    /**
     * Initializes the manager.
     *
     * @param client The instance of the bot.
     */
    static init(client: Bot) {
        this.client = client;
    }

    /**
     * Creates an operation result object.
     *
     * @param success Whether the operation was successful.
     * @returns The operation result object.
     */
    protected static createOperationResult(
        success: true,
    ): OperationResult<true>;

    /**
     * Creates an operation result object.
     *
     * @param success Whether the operation was successful.
     * @param reason The reason for why the operation failed.
     * @returns The operation result object.
     */
    protected static createOperationResult(
        success: false,
        reason: string,
    ): OperationResult<false>;

    /**
     * Creates an operation result object.
     *
     * @param success Whether the operation was successful.
     * @param reason The reason for why the operation failed.
     * @returns The operation result object.
     */
    protected static createOperationResult(
        success: boolean,
        reason?: string,
    ): OperationResult;

    protected static createOperationResult(
        success: boolean,
        reason?: string,
    ): OperationResult {
        return {
            success: success,
            reason: reason,
            isSuccessful() {
                return this.success;
            },
            failed() {
                return !this.success;
            },
        };
    }

    /**
     * Creates an operation result object.
     *
     * @param success Whether the operation was successful.
     * @returns The operation result object.
     */
    protected createOperationResult(success: true): OperationResult<true>;

    /**
     * Creates an operation result object.
     *
     * @param success Whether the operation was successful.
     * @param reason The reason for why the operation failed.
     * @returns The operation result object.
     */
    protected createOperationResult(
        success: false,
        reason: string,
    ): OperationResult<false>;

    /**
     * Creates an operation result object.
     *
     * @param success Whether the operation was successful.
     * @param reason The reason for why the operation failed.
     * @returns The operation result object.
     */
    protected createOperationResult(
        success: boolean,
        reason?: string,
    ): OperationResult;

    protected createOperationResult(
        success: boolean,
        reason?: string,
    ): OperationResult {
        // TODO: refactor everything that non-nulls reason
        return {
            success: success,
            reason: reason,
            isSuccessful() {
                return this.success;
            },
            failed() {
                return !this.success;
            },
        };
    }
}
