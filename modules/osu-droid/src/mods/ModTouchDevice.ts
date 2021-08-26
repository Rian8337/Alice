import { Mod } from "./Mod";

/**
 * Represents the TouchDevice mod.
 */
export class ModTouchDevice extends Mod {
    readonly scoreMultiplier: number = 1;
    readonly acronym: string = "TD";
    readonly name: string = "TouchDevice";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 2;
    readonly droidString: string = "";
    readonly droidOnly: boolean = false;
}