import { Mod } from "./Mod";

/**
 * Represents the Auto mod.
 */
export class ModAuto extends Mod {
    readonly scoreMultiplier: number = 0;
    readonly acronym: string = "AT";
    readonly name: string = "Autoplay";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = 1 << 11;
    readonly droidString: string = "a";
    readonly droidOnly: boolean = false;
}