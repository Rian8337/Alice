import { Mod } from "./Mod";

/**
 * Represents the Precise mod.
 */
export class ModPrecise extends Mod {
    override readonly scoreMultiplier: number = 1.06;
    override readonly acronym: string = "PR";
    override readonly name: string = "Precise";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = false;
    override readonly bitwise: number = Number.NaN;
    override readonly droidString: string = "s";
    override readonly droidOnly: boolean = true;
}
