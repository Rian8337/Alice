import { Mod } from "./Mod";

/**
 * Represents the Relax mod.
 */
export class ModRelax extends Mod {
    override readonly scoreMultiplier: number = 0;
    override readonly acronym: string = "RX";
    override readonly name: string = "Relax";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly bitwise: number = 1 << 7;
    override readonly droidString: string = "x";
    override readonly droidOnly: boolean = false;
}
