import { PassRequirementType } from "@alice-types/challenge/PassRequirementType";

/**
 * Represents a pass requirement of a challenge.
 */
export interface PassRequirement {
    /**
     * The type of the pass requirement.
     */
    id: PassRequirementType;

    /**
     * The value that must be fulfilled to pass the challenge.
     */
    value: string | number;
}
