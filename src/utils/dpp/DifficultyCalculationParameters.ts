import { CloneableDifficultyCalculationParameters } from "@alice-structures/dpp/CloneableDifficultyCalculationParameters";
import { MapStats, ModUtil } from "@rian8337/osu-base";

/**
 * Represents a parameter to alter difficulty calculation result.
 */
export class DifficultyCalculationParameters {
    /**
     * Constructs a `DifficultyCalculationParameters` object from raw data.
     *
     * @param data The data.
     */
    static from(
        data: CloneableDifficultyCalculationParameters
    ): DifficultyCalculationParameters {
        return new this(
            new MapStats({
                ...data.customStatistics,
                mods: ModUtil.pcStringToMods(data.customStatistics?.mods ?? ""),
            })
        );
    }

    /**
     * Custom statistics to apply mods, custom speed multiplier, and force AR
     * as well as NightCore mod penalty for replay version 3 or older.
     */
    customStatistics?: MapStats;

    /**
     * @param customStatistics Custom statistics to apply mods, custom speed multiplier and force AR as well as NightCore mod penalty for replay version 3 or older.
     */
    constructor(customStatistics?: MapStats) {
        this.customStatistics = customStatistics;
    }
}
