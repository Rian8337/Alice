import { Mod } from "./Mod";

/**
 * Represents the SpunOut mod.
 */
export class ModSpunOut extends Mod {
    override readonly scoreMultiplier: number = 0.9;
    override readonly acronym: string = "SO";
    override readonly name: string = "SpunOut";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = true;
    override readonly bitwise: number = 1 << 12;
    override readonly droidString: string = "";
    override readonly droidOnly: boolean = false;
}
