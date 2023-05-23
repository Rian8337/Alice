/**
 * Status of pp submission operation.
 */
export interface PPSubmissionStatus {
    /**
     * Whether the operation was successful.
     */
    success: boolean;

    /**
     * The reason for failure.
     */
    reason?: string;

    /**
     * Whether the replay file needs to be persisted.
     */
    replayNeedsPersistence?: boolean;
}
