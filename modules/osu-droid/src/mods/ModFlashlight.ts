import { Mod } from "./Mod";

/**
 * Represents the Flashlight mod.
 */
export class ModFlashlight extends Mod {
    readonly scoreMultiplier: number = 1.12;
    readonly acronym: string = "FL";
    readonly name: string = "Flashlight";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 10;
    readonly droidString: string = "i";
    readonly droidOnly: boolean = false;
}