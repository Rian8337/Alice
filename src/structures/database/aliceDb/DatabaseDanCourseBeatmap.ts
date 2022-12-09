import { DanCoursePassRequirement } from "@alice-structures/dancourse/DanCoursePassRequirement";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a dan course beatmap.
 */
export interface DatabaseDanCourseBeatmap extends BaseDocument {
    /**
     * The MD5 hash of the .osu file of the beatmap.
     */
    readonly hash: string;

    /**
     * The requirement to pass the course.
     */
    readonly requirement: DanCoursePassRequirement;

    /**
     * The name of the .osu file of the beatmap.
     */
    readonly fileName: string;
}
