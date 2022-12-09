import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DanCoursePassRequirement } from "@alice-structures/dancourse/DanCoursePassRequirement";
import { DatabaseDanCourseBeatmap } from "@alice-structures/database/aliceDb/DatabaseDanCourseBeatmap";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "mongodb";

/**
 * Represents a dan course beatmap.
 */
export class DanCourseBeatmap
    extends Manager
    implements DatabaseDanCourseBeatmap
{
    hash: string;
    requirement: DanCoursePassRequirement;
    fileName: string;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseDanCourseBeatmap = DatabaseManager.aliceDb?.collections
            .danCourseBeatmaps.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.hash = data.hash;
        this.requirement = data.requirement;
        this.fileName = data.fileName;
    }
}
