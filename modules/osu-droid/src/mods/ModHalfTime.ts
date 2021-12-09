import { Mod } from "./Mod";

/**
 * Represents the HalfTime mod.
 */
export class ModHalfTime extends Mod {
    override readonly scoreMultiplier: number = 0.3;
    override readonly acronym: string = "HT";
    override readonly name: string = "HalfTime";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly bitwise: number = 1 << 8;
    override readonly droidString: string = "t";
    override readonly droidOnly: boolean = false;
}
