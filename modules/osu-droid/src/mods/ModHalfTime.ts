import { Mod } from "./Mod";

/**
 * Represents the HalfTime mod.
 */
export class ModHalfTime extends Mod {
    readonly scoreMultiplier: number = 0.3;
    readonly acronym: string = "HT";
    readonly name: string = "HalfTime";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 8;
    readonly droidString: string = "t";
    readonly droidOnly: boolean = false;
}