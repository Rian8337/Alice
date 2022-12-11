import { DanCoursePassRequirementType } from "./DanCoursePassRequirementType";

/**
 * Represents a pass requirement of a dan course beatmap.
 */
export interface DanCoursePassRequirement {
    /**
     * The type of the pass requirement.
     */
    readonly id: DanCoursePassRequirementType;

    /**
     * The value that must be fulfilled to pass the course.
     */
    readonly value: number;

    /**
     * The combination of mods that must be used to pass the course.
     */
    readonly requiredMods?: string;

    /**
     * The custom speed multiplier required to pass the course.
     */
    readonly speedMultiplier?: number;

    /**
     * Whether to allow slider lock to be used.
     */
    readonly allowSliderLock?: boolean;

    /**
     * Whether to force slider accuracy to be used.
     */
    readonly forceSliderAccuracy?: boolean;

    /**
     * Settings for forced AR.
     */
    readonly forcedAR?: {
        /**
         * The allowable minimum value of forced AR.
         */
        readonly minValue?: number;

        /**
         * The allowable maximum value of forced AR.
         */
        readonly maxValue?: number;
    };
}
