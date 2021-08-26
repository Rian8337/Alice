import { Mod } from "./Mod";

/**
 * Represents the Autopilot mod.
 */
export class ModAutopilot extends Mod {
    readonly scoreMultiplier: number = 0;
    readonly acronym: string = "AP";
    readonly name: string = "Autopilot";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = 1 << 13;
    readonly droidString: string = "p";
    readonly droidOnly: boolean = false;
}