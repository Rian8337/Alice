import { Mod } from "./Mod";

/**
 * Represents the DoubleTime mod.
 */
export class ModDoubleTime extends Mod {
    readonly scoreMultiplier: number = 1.12;
    readonly acronym: string = "DT";
    readonly name: string = "DoubleTime";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 6;
    readonly droidString: string = "d";
    readonly droidOnly: boolean = false;
}