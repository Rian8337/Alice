import { Mod } from "./Mod";

/**
 * Represents the HardRock mod.
 */
export class ModHardRock extends Mod {
    readonly scoreMultiplier: number = 1.06;
    readonly acronym: string = "HR";
    readonly name: string = "HardRock";
    readonly bitwise: number = 1 << 4;
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly droidString: string = "r";
    readonly droidOnly: boolean = false;
}