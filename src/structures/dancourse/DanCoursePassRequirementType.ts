import { PassRequirementType } from "@alice-structures/challenge/PassRequirementType";

/**
 * The type of requirement to pass a dan course beatmap.
 */
export type DanCoursePassRequirementType = Omit<
    PassRequirementType,
    "scorev2" | "dpp" | "pp"
>;
