import { Mod } from "./Mod";

/**
 * Represents the Relax mod.
 */
export class ModRelax extends Mod {
    readonly scoreMultiplier: number = 0;
    readonly acronym: string = "RX";
    readonly name: string = "Relax";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = 1 << 7;
    readonly droidString: string = "x";
    readonly droidOnly: boolean = false;
}