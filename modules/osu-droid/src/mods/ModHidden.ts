import { Mod } from "./Mod";

/**
 * Represents the Hidden mod.
 */
export class ModHidden extends Mod {
    readonly scoreMultiplier: number = 1.06;
    readonly acronym: string = "HD";
    readonly name: string = "Hidden";
    readonly bitwise: number = 1 << 3;
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidString: string = "h";
    readonly droidOnly: boolean = false;
}