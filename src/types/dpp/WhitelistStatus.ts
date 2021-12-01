/**
 * The status of a beatmap in regards of whitelisting.
 *
 * - `updated`: The beatmap is whitelisted and updated.
 * - `whitelisted`: The beatmap is whitelisted, but not updated.
 * - `not whitelisted`: The beatmap is not whitelisted.
 */
export type WhitelistStatus = "updated" | "whitelisted" | "not whitelisted";
