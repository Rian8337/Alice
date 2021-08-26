import { Mod } from "./Mod";

/**
 * Represents the SpunOut mod.
 */
export class ModSpunOut extends Mod {
    readonly scoreMultiplier: number = 0.9;
    readonly acronym: string = "SO";
    readonly name: string = "SpunOut";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = true;
    readonly bitwise: number = 1 << 12;
    readonly droidString: string = "";
    readonly droidOnly: boolean = false;
}