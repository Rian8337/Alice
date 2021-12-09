import { Mod } from "./Mod";

/**
 * Represents the Easy mod.
 */
export class ModEasy extends Mod {
    override readonly scoreMultiplier: number = 0.5;
    override readonly acronym: string = "EZ";
    override readonly name: string = "Easy";
    override readonly droidRanked: boolean = true;
    override readonly pcRanked: boolean = true;
    override readonly bitwise: number = 1 << 1;
    override readonly droidString: string = "e";
    override readonly droidOnly: boolean = false;
}
