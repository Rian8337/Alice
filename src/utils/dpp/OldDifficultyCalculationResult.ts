import { CacheableDifficultyAttributes } from "@alice-structures/difficultyattributes/CacheableDifficultyAttributes";
import { OldDroidDifficultyAttributes } from "@alice-structures/difficultyattributes/OldDroidDifficultyAttributes";
import { ChartCreator } from "@alice-utils/creators/ChartCreator";
import { MapInfo, Vector2 } from "@rian8337/osu-base";
import { loadImage } from "canvas";
import { std_diff } from "ojsamadroid";
import { DifficultyCalculationParameters } from "./DifficultyCalculationParameters";

/**
 * Represents a beatmap's old difficulty calculation result.
 */
export class OldDifficultyCalculationResult {
    /**
     * The beatmap being calculated.
     */
    readonly map: MapInfo<true>;

    /**
     * The calculation parameters.
     */
    readonly params: DifficultyCalculationParameters;

    /**
     * The difficulty calculator that calculated the beatmap.
     */
    readonly result: std_diff;

    /**
     * The difficulty attributes resulted from this calculation.
     */
    readonly attributes: OldDroidDifficultyAttributes;

    /**
     * The attributes that were cached into the cache manager as a result of this calculation.
     */
    readonly cachedAttributes: CacheableDifficultyAttributes<OldDroidDifficultyAttributes>;

    private strainGraphImage?: Buffer;

    /**
     * A string containing information about this performance calculation result's star rating.
     */
    get starRatingInfo(): string {
        let string: string = `${this.attributes.starRating.toFixed(2)} stars (`;
        const starRatingDetails: string[] = [];

        const addDetail = (num: number, suffix: string) =>
            starRatingDetails.push(`${num.toFixed(2)} ${suffix}`);

        addDetail(this.attributes.aimDifficulty, "aim");
        addDetail(this.attributes.tapDifficulty, "speed");

        string += starRatingDetails.join(", ") + ")";

        return string;
    }

    constructor(
        map: MapInfo<true>,
        params: DifficultyCalculationParameters,
        result: std_diff,
        attributes: OldDroidDifficultyAttributes,
        cachedAttributes: CacheableDifficultyAttributes<OldDroidDifficultyAttributes>
    ) {
        this.map = map;
        this.params = params;
        this.result = result;
        this.attributes = attributes;
        this.cachedAttributes = cachedAttributes;
    }

    /**
     * Generates the strain chart of this calculation result.
     */
    async generateStrainChart(): Promise<Buffer> {
        if (this.strainGraphImage) {
            return this.strainGraphImage;
        }

        const sectionLength: number = 400;

        const currentSectionEnd: number =
            Math.ceil(
                this.map.beatmap.hitObjects.objects[0].startTime / sectionLength
            ) * sectionLength;

        const strainInformations: {
            readonly time: number;
            readonly strain: number;
        }[] = new Array(
            Math.max(
                this.result.aim_strain_peaks.length,
                this.result.speed_strain_peaks.length
            )
        );

        for (let i = 0; i < strainInformations.length; ++i) {
            const aimStrain: number = this.result.aim_strain_peaks[i] ?? 0;
            const speedStrain: number = this.result.speed_strain_peaks[i] ?? 0;

            strainInformations[i] = {
                time: (currentSectionEnd + sectionLength * i) / 1000,
                strain: (aimStrain + speedStrain) / 2,
            };
        }

        const maxTime: number =
            strainInformations.at(-1)!.time ??
            this.map.beatmap.hitObjects.objects.at(-1)!.endTime / 1000;
        const maxStrain: number = Math.max(
            ...strainInformations.map((v) => {
                return v.strain;
            }),
            1
        );

        const maxXUnits: number = 10;
        const maxYUnits: number = 10;

        const unitsPerTickX: number = Math.ceil(maxTime / maxXUnits / 10) * 10;
        const unitsPerTickY: number =
            Math.ceil(maxStrain / maxYUnits / 20) * 20;

        const chart: ChartCreator = new ChartCreator({
            graphWidth: 900,
            graphHeight: 250,
            minX: 0,
            minY: 0,
            maxX: Math.ceil(maxTime / unitsPerTickX) * unitsPerTickX,
            maxY: Math.ceil(maxStrain / unitsPerTickY) * unitsPerTickY,
            unitsPerTickX,
            unitsPerTickY,
            background: await loadImage(
                `https://assets.ppy.sh/beatmaps/${this.map.beatmapsetID}/covers/cover.jpg`
            ).catch(() => {
                return undefined;
            }),
            xLabel: "Time",
            yLabel: "Strain",
            pointRadius: 0,
            xValueType: "time",
        });

        chart.drawArea(
            strainInformations.map((v) => new Vector2(v.time, v.strain)),
            "#991ed6"
        );

        this.strainGraphImage = chart.getBuffer();

        return this.strainGraphImage;
    }
}
