import { Mod } from "./Mod";

/**
 * Represents the SuddenDeath mod.
 */
export class ModSuddenDeath extends Mod {
    readonly scoreMultiplier: number = 1;
    readonly acronym: string = "SD";
    readonly name: string = "Sudden Death";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 5;
    readonly droidString: string = "u";
    readonly droidOnly: boolean = false;
}