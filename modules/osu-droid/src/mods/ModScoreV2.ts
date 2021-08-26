import { Mod } from "./Mod";

/**
 * Represents the ScoreV2 mod.
 */
export class ModScoreV2 extends Mod {
    readonly scoreMultiplier: number = 1;
    readonly acronym: string = "V2";
    readonly name: string = "ScoreV2";
    readonly droidRanked: boolean = false;
    readonly pcRanked: boolean = false;
    readonly bitwise: number = 1 << 29;
    readonly droidString: string = "v";
    readonly droidOnly: boolean = false;
}