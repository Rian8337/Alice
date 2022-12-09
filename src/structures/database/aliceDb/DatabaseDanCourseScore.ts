import { MultiplayerScore } from "@alice-structures/multiplayer/MultiplayerScore";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a dan course score.
 */
export interface DatabaseDanCourseScore extends MultiplayerScore, BaseDocument {
    /**
     * The grade of the score based on the pass requirement of the course.
     *
     * `null` means this score didn't pass the course.
     */
    readonly grade: number;

    /**
     * The name of replay file of the score.
     */
    readonly replayFileName: string;
}
