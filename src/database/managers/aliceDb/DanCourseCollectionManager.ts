import { DanCourse } from "@alice-database/utils/aliceDb/DanCourse";
import { DatabaseDanCourse } from "@alice-structures/database/aliceDb/DatabaseDanCourse";
import { ApplicationCommandOptionChoiceData } from "discord.js";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `dancoursemaps` collection.
 */
export class DanCourseCollectionManager extends DatabaseCollectionManager<
    DatabaseDanCourse,
    DanCourse
> {
    protected override utilityInstance: new (
        data: DatabaseDanCourse
    ) => DanCourse = DanCourse;

    override get defaultDocument(): DatabaseDanCourse {
        return {
            courseName: "",
            fileName: "",
            hash: "",
            roleId: "",
            requirement: {
                id: "score",
                value: 0,
            },
        };
    }

    /**
     * Searches courses based on search query for autocomplete response.
     *
     * @param searchQuery The course name to search.
     * @param amount The maximum amount of results to return. Defaults to 25.
     * @returns The course names that match the query.
     */
    async searchBeatmapsForAutocomplete(
        searchQuery: string | RegExp,
        amount: number = 25
    ): Promise<ApplicationCommandOptionChoiceData<string>[]> {
        let regExp: RegExp;

        try {
            regExp = new RegExp(searchQuery, "i");
        } catch {
            return [];
        }

        const result: DatabaseDanCourse[] = await this.collection
            .find(
                { courseName: regExp },
                { projection: { _id: 0, courseName: 1 } }
            )
            .limit(amount)
            .toArray();

        return result.map((v) => {
            return {
                name: v.courseName,
                value: v.courseName,
            };
        });
    }

    /**
     * Gets a course from its course name.
     *
     * @param courseName The name of the course.
     * @returns The course, `null` if not found.
     */
    getCourse(courseName: string): Promise<DanCourse | null> {
        return this.getOne({ courseName: courseName });
    }
}
