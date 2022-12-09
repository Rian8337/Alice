import { DanCourseBeatmap } from "@alice-database/utils/aliceDb/DanCourseBeatmap";
import { DatabaseDanCourseBeatmap } from "@alice-structures/database/aliceDb/DatabaseDanCourseBeatmap";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `dancoursemaps` collection.
 */
export class DanCourseBeatmapCollectionManager extends DatabaseCollectionManager<
    DatabaseDanCourseBeatmap,
    DanCourseBeatmap
> {
    protected override utilityInstance: new (
        data: DatabaseDanCourseBeatmap
    ) => DanCourseBeatmap = DanCourseBeatmap;

    override get defaultDocument(): DatabaseDanCourseBeatmap {
        return {
            fileName: "",
            hash: "",
            requirement: {
                id: "score",
                value: 0,
            },
        };
    }

    /**
     * Gets a beatmap from its MD5 hash.
     *
     * @param hash The MD5 hash of the beatmap.
     * @returns The beatmap, `null` if not found.
     */
    getBeatmap(hash: string): Promise<DanCourseBeatmap | null> {
        return this.getOne({ hash: hash });
    }
}
