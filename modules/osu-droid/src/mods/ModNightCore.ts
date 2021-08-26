import { Mod } from "./Mod";

/**
 * Represents the NightCore mod.
 */
export class ModNightCore extends Mod {
    readonly scoreMultiplier: number = 1.12;
    readonly acronym: string = "NC";
    readonly name: string = "NightCore";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 9;
    readonly droidString: string = "c";
    readonly droidOnly: boolean = false;
}