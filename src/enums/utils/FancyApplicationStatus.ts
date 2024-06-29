/**
 * Available statuses of a fancy lounge application.
 */
export enum FancyApplicationStatus {
    /**
     * The application is pending approval for voting.
     */
    pendingApproval,

    /**
     * The application is in voting phase.
     */
    inVote,

    /**
     * The application is being reviewed after voting phase.
     */
    inReview,

    /**
     * The application is cancelled.
     */
    cancelled,

    /**
     * The application is rejected.
     */
    rejected,

    /**
     * The application is accepted.
     */
    accepted,
}
