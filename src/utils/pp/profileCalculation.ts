/**
 * Decides whether a calculated prototype profile can be saved.
 *
 * A player with top scores but no calculated score means that the processors could not calculate anything (for example
 * because the variant is unavailable), and saving would overwrite the stored profile with an empty one.
 *
 * @param calculatedEntryCount The number of scores that were calculated.
 * @returns The reason for why the profile must not be saved, `null` if it can be saved.
 */
export function getProfileCalculationFailure(
    calculatedEntryCount: number,
): string | null {
    return calculatedEntryCount === 0 ? "No scores could be calculated" : null;
}
