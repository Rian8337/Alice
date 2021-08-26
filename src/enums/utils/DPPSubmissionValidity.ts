/**
 * Marks the validity of a score for droid performance points (dpp) submission.
 */
export enum DPPSubmissionValidity {
    UID_IS_BANNED,
    BEATMAP_NOT_FOUND,
    BEATMAP_IS_BLACKLISTED,
    BEATMAP_NOT_WHITELISTED,
    SCORE_USES_FORCE_AR,
    SCORE_USES_CUSTOM_SPEED,
    VALID
};