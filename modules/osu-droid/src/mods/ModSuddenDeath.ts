import { Mod } from "./Mod";

/**
 * Represents the SuddenDeath mod.
 */
export class ModSuddenDeath extends Mod {
    override readonly scoreMultiplier: number = 1;
    override readonly acronym: string = "SD";
    override readonly name: string = "Sudden Death";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = true;
    override readonly bitwise: number = 1 << 5;
    override readonly droidString: string = "u";
    override readonly droidOnly: boolean = false;
}
