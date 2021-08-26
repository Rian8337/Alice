import { Mod } from "./Mod";

/**
 * Represents the NoFail mod.
 */
export class ModNoFail extends Mod {
    readonly scoreMultiplier: number = 0.5;
    readonly acronym: string = "NF";
    readonly name: string = "NoFail";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 0;
    readonly droidString: string = "n";
    readonly droidOnly: boolean = false;
}