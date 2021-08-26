import { Mod } from "./Mod";

/**
 * Represents the Perfect mod.
 */
export class ModPerfect extends Mod {
    readonly scoreMultiplier: number = 1;
    readonly acronym: string = "PF";
    readonly name: string = "Perfect";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 14;
    readonly droidString: string = "f";
    readonly droidOnly: boolean = false;
}