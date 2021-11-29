/**
 * Marks the validity of a whitelisted beatmap.
 */
export enum WhitelistValidity {
    BEATMAP_NOT_FOUND,
    DOESNT_NEED_WHITELISTING,
    OUTDATED_HASH,
    VALID
}