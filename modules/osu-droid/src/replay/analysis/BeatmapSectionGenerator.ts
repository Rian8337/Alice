import { DifficultyHitObject } from "../../difficulty/preprocessing/DifficultyHitObject";
import { StarRating } from "../../difficulty/base/StarRating";
import { BeatmapSection } from "./data/BeatmapSection";

/**
 * A beatmap section generator that generates beatmap section based on aim/speed strain.
 */
export abstract class BeatmapSectionGenerator {
    /**
     * Generates `BeatmapSection`s for the specified beatmap.
     *
     * @param map The beatmap to generate.
     * @param minSectionObjectCount The maximum delta time allowed between two beatmap sections.
     * Increasing this number decreases the amount of beatmap sections in general. Note that this value does not account for the speed multiplier of
     * the play, similar to the way replay object data is stored.
     * @param maxSectionDeltaTime The minimum object count required to make a beatmap section. Increasing this number decreases the amount of beatmap sections.
     */
    static generateSections(
        map: StarRating,
        minSectionObjectCount: number,
        maxSectionDeltaTime: number
    ): BeatmapSection[] {
        const beatmapSections: BeatmapSection[] = [];
        let firstObjectIndex: number = 0;

        for (let i = 0; i < map.objects.length - 1; ++i) {
            const current: DifficultyHitObject = map.objects[i];
            const next: DifficultyHitObject = map.objects[i + 1];

            const realDeltaTime: number =
                next.object.startTime - current.object.endTime;

            if (realDeltaTime >= maxSectionDeltaTime) {
                // Ignore sections that don't meet object count requirement.
                if (i - firstObjectIndex < minSectionObjectCount) {
                    firstObjectIndex = i + 1;
                    continue;
                }

                beatmapSections.push({
                    firstObjectIndex,
                    lastObjectIndex: i,
                });

                firstObjectIndex = i + 1;
            }
        }

        // Don't forget to manually add the last beatmap section, which would otherwise be ignored.
        if (map.objects.length - firstObjectIndex > minSectionObjectCount) {
            beatmapSections.push({
                firstObjectIndex,
                lastObjectIndex: map.objects.length - 1,
            });
        }

        return beatmapSections;
    }
}
