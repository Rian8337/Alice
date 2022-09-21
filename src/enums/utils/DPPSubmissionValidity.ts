/**
 * Marks the validity of a score for droid performance points (dpp) submission.
 */
export enum DPPSubmissionValidity {
    beatmapNotFound,
    beatmapTooShort,
    beatmapIsBlacklisted,
    beatmapNotWhitelisted,
    scoreUsesForceAR,
    scoreUsesCustomSpeed,
    valid,
}
