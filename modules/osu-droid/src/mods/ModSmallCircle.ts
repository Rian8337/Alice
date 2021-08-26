import { Mod } from "./Mod";

/**
 * Represents the SmallCircle mod.
 */
export class ModSmallCircle extends Mod {
    readonly scoreMultiplier: number = 1.06;
    readonly acronym: string = "SC";
    readonly name: string = "SmallCircle";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = Number.NaN;
    readonly droidString: string = "m";
    readonly droidOnly: boolean = true;
}