/**
 * The base of an operation result.
 */
export interface BaseOperationResult {
    /**
     * Whether the operation was successful.
     */
    success: boolean;

    /**
     * The reason for why the operation failed.
     */
    reason?: string;
};