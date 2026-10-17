import { describe, expect, it } from "vitest";
import { getProfileCalculationFailure } from "./profileCalculation";

describe("getProfileCalculationFailure", () => {
    it("does not save a profile when no score was calculated", () => {
        expect(getProfileCalculationFailure(0)).toBe(
            "No scores could be calculated",
        );
    });

    it("saves a profile when at least one score was calculated", () => {
        expect(getProfileCalculationFailure(1)).toBeNull();
        expect(getProfileCalculationFailure(100)).toBeNull();
    });
});
