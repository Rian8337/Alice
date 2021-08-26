import { Mod } from "./Mod";

/**
 * Represents the Precise mod.
 */
export class ModPrecise extends Mod {
    readonly scoreMultiplier: number = 1.06;
    readonly acronym: string = "PR";
    readonly name: string = "Precise";
    readonly droidRanked: boolean = true;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = Number.NaN;
    readonly droidString: string = "s";
    readonly droidOnly: boolean = true;
}