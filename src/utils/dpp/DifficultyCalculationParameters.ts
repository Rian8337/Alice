import { CloneableDifficultyCalculationParameters } from "@structures/dpp/CloneableDifficultyCalculationParameters";
import { Mod, ModDifficultyAdjust, ModUtil } from "@rian8337/osu-base";
import {
    DifficultyCalculationOptions,
    DroidDifficultyCalculationOptions,
} from "@rian8337/osu-difficulty-calculator";

/**
 * Represents a parameter to alter difficulty calculation result.
 */
export interface DifficultyCalculationParametersInit {
    /**
     * The mods to calculate for. Defaults to No Mod.
     */
    mods?: Mod[];

    /**
     * The custom speed multiplier to calculate for. Defaults to 1.
     */
    customSpeedMultiplier?: number;

    /**
     * The circle size to enforce. Defaults to the beatmap's original circle size.
     */
    forceCS?: number;

    /**
     * The approach rate to enforce. Defaults to the beatmap's original approach rate.
     */
    forceAR?: number;

    /**
     * The overall difficulty to enforce. Defaults to the beatmap's original overall difficulty.
     */
    forceOD?: number;

    /**
     * The health drain to enforce. Defaults to the beatmap's original health drain.
     */
    forceHP?: number;

    /**
     * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older). Defaults to `false`.
     */
    oldStatistics?: boolean;
}

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
        data: CloneableDifficultyCalculationParameters,
    ): DifficultyCalculationParameters {
        return new this({
            ...data,
            mods: ModUtil.pcStringToMods(data.mods),
        });
    }

    /**
     * The mods to calculate for.
     */
    mods: Mod[];

    /**
     * The custom speed multiplier to calculate for.
     */
    customSpeedMultiplier: number;

    /**
     * The circle size to enforce. Defaults to the beatmap's original circle size.
     */
    forceCS?: number;

    /**
     * The approach rate to enforce. Defaults to the beatmap's original approach rate.
     */
    forceAR?: number;

    /**
     * The overall difficulty to enforce. Defaults to the beatmap's original overall difficulty.
     */
    forceOD?: number;

    /**
     * The health drain to enforce. Defaults to the beatmap's original health drain.
     */
    forceHP?: number;

    /**
     * Whether to calculate for old statistics for osu!droid gamemode (1.6.7 and older).
     */
    oldStatistics?: boolean;

    constructor(values?: DifficultyCalculationParametersInit) {
        this.mods = values?.mods ?? [];
        this.customSpeedMultiplier = values?.customSpeedMultiplier ?? 1;
        this.forceCS = values?.forceCS;
        this.forceAR = values?.forceAR;
        this.forceOD = values?.forceOD;
        this.forceHP = values?.forceHP;
        this.oldStatistics = values?.oldStatistics;
    }

    /**
     * Returns a cloneable form of this parameter.
     */
    toCloneable(): CloneableDifficultyCalculationParameters {
        return {
            mods: ModUtil.modsToOsuString(this.mods),
            customSpeedMultiplier: this.customSpeedMultiplier,
            forceCS: this.forceCS,
            forceAR: this.forceAR,
            forceOD: this.forceOD,
            forceHP: this.forceHP,
            oldStatistics: this.oldStatistics,
        };
    }

    /**
     * Converts this parameter to a `DroidDifficultyCalculationOptions`.
     */
    toDroidDifficultyCalculationOptions(): DroidDifficultyCalculationOptions {
        const mods = this.mods.slice();
        const difficultyAdjustMod = this.convertForceDifficultyStatistics();

        if (difficultyAdjustMod) {
            mods.push(difficultyAdjustMod);
        }

        return {
            mods: mods,
            customSpeedMultiplier: this.customSpeedMultiplier,
            oldStatistics: this.oldStatistics,
        };
    }

    /**
     * Converts this parameter to an `DifficultyCalculationOptions`.
     */
    toDifficultyCalculationOptions(): DifficultyCalculationOptions {
        const mods = this.mods.slice();
        const difficultyAdjustMod = this.convertForceDifficultyStatistics();

        if (difficultyAdjustMod) {
            mods.push(difficultyAdjustMod);
        }

        return {
            mods: mods,
            customSpeedMultiplier: this.customSpeedMultiplier,
        };
    }

    /**
     * Converts any force difficulty statistics (CS, AR, OD, and HP) if they are present to a `ModDifficultyAdjust`.
     */
    protected convertForceDifficultyStatistics(): ModDifficultyAdjust | null {
        if (
            [this.forceCS, this.forceAR, this.forceOD, this.forceHP].some(
                (v) => v !== undefined,
            )
        ) {
            return new ModDifficultyAdjust({
                cs: this.forceCS,
                ar: this.forceAR,
                od: this.forceOD,
                hp: this.forceHP,
            });
        }

        return null;
    }
}
