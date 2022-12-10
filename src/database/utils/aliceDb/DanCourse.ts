import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DanCoursePassRequirement } from "@alice-structures/dancourse/DanCoursePassRequirement";
import { DatabaseDanCourse } from "@alice-structures/database/aliceDb/DatabaseDanCourse";
import { Manager } from "@alice-utils/base/Manager";
import { Snowflake } from "discord.js";
import { ObjectId } from "mongodb";

/**
 * Represents a dan course.
 */
export class DanCourse extends Manager implements DatabaseDanCourse {
    courseName: string;
    hash: string;
    requirement: DanCoursePassRequirement;
    fileName: string;
    roleId: Snowflake;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseDanCourse = DatabaseManager.aliceDb?.collections
            .danCourses.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.courseName = data.courseName;
        this.hash = data.hash;
        this.requirement = data.requirement;
        this.fileName = data.fileName;
        this.roleId = data.roleId;
    }
}
