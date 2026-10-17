import { describe, expect, it } from "vitest";
import { DefaultPPVariants } from "./DefaultPPVariants";
import { prototypeVariants } from "./prototypeVariants";

describe("prototypeVariants", () => {
    it("uses droid-rebalance as master for other variants", () => {
        expect(prototypeVariants("my-experiment")).toEqual({
            live: DefaultPPVariants.droidLive,
            local: "my-experiment",
            master: DefaultPPVariants.droidRebalance,
        });
    });

    it("has no master for droid-rebalance", () => {
        expect(prototypeVariants(DefaultPPVariants.droidRebalance)).toEqual({
            live: DefaultPPVariants.droidLive,
            local: DefaultPPVariants.droidRebalance,
        });
    });
});
