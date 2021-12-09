import { Mod } from "./Mod";

/**
 * Represents the Hidden mod.
 */
export class ModHidden extends Mod {
    override readonly scoreMultiplier: number = 1.06;
    override readonly acronym: string = "HD";
    override readonly name: string = "Hidden";
    override readonly bitwise: number = 1 << 3;
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly droidString: string = "h";
    override readonly droidOnly: boolean = false;
}
