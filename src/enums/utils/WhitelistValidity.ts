/**
 * Marks the validity of a whitelisted beatmap.
 */
export enum WhitelistValidity {
    beatmapNotFound,
    doesntNeedWhitelisting,
    outdatedHash,
    valid,
}
