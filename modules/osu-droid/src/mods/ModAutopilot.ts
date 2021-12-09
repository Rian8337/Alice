import { Mod } from "./Mod";

/**
 * Represents the Autopilot mod.
 */
export class ModAutopilot extends Mod {
    override readonly scoreMultiplier: number = 0;
    override readonly acronym: string = "AP";
    override readonly name: string = "Autopilot";
    override readonly droidRanked: boolean = false;
    override readonly pcRanked: boolean = false;
    override readonly bitwise: number = 1 << 13;
    override readonly droidString: string = "p";
    override readonly droidOnly: boolean = false;
}
