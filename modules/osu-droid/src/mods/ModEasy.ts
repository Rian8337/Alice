import { Mod } from "./Mod";

/**
 * Represents the Easy mod.
 */
export class ModEasy extends Mod {
    readonly scoreMultiplier: number = 0.5;
    readonly acronym: string = "EZ";
    readonly name: string = "Easy";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 1;
    readonly droidString: string = "e";
    readonly droidOnly: boolean = false;
}