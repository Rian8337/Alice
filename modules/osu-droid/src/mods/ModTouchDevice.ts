import { Mod } from "./Mod";

/**
 * Represents the TouchDevice mod.
 */
export class ModTouchDevice extends Mod {
    override readonly scoreMultiplier: number = 1;
    override readonly acronym: string = "TD";
    override readonly name: string = "TouchDevice";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly bitwise: number = 1 << 2;
    override readonly droidString: string = "";
    override readonly droidOnly: boolean = false;
}
