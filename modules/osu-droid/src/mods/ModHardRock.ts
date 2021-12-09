import { Mod } from "./Mod";

/**
 * Represents the HardRock mod.
 */
export class ModHardRock extends Mod {
    override readonly scoreMultiplier: number = 1.06;
    override readonly acronym: string = "HR";
    override readonly name: string = "HardRock";
    override readonly bitwise: number = 1 << 4;
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly droidString: string = "r";
    override readonly droidOnly: boolean = false;
}
