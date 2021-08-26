import { Mod } from "./Mod";

/**
 * Represents the ReallyEasy mod.
 */
export class ModReallyEasy extends Mod {
    readonly scoreMultiplier: number = 0.4;
    readonly acronym: string = "RE";
    readonly name: string = "ReallyEasy";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = Number.NaN;
    readonly droidString: string = "l";
    readonly droidOnly: boolean = true;
}