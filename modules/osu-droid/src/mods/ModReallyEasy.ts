import { Mod } from "./Mod";

/**
 * Represents the ReallyEasy mod.
 */
export class ModReallyEasy extends Mod {
    override readonly scoreMultiplier: number = 0.4;
    override readonly acronym: string = "RE";
    override readonly name: string = "ReallyEasy";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly bitwise: number = Number.NaN;
    override readonly droidString: string = "l";
    override readonly droidOnly: boolean = true;
}
