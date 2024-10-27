import { DanCoursePassRequirement } from "@structures/dancourse/DanCoursePassRequirement";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a dan course.
 */
export interface DatabaseDanCourse extends BaseDocument {
    /**
     * The name of the course.
     */
    readonly courseName: string;

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

    /**
     * The ID of the role corresponding to this course.
     */
    readonly roleId: Snowflake;
}
