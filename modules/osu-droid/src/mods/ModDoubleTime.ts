import { Mod } from "./Mod";

/**
 * Represents the DoubleTime mod.
 */
export class ModDoubleTime extends Mod {
    override readonly scoreMultiplier: number = 1.12;
    override readonly acronym: string = "DT";
    override readonly name: string = "DoubleTime";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly bitwise: number = 1 << 6;
    override readonly droidString: string = "d";
    override readonly droidOnly: boolean = false;
}
