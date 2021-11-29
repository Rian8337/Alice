/**
 * Represents an operation result.
 */
export interface OperationResult {
    /**
     * Whether the operation was successful.
     */
    success: boolean;

    /**
     * The reason for why the operation failed.
     */
    reason?: string;
}