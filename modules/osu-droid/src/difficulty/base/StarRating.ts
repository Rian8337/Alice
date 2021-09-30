import { loadImage } from 'canvas';
import { Beatmap } from '../../beatmap/Beatmap';
import { modes } from '../../constants/modes';
import { MapStats } from '../../utils/MapStats';
import { DifficultyHitObject } from '../preprocessing/DifficultyHitObject';
import { DifficultyHitObjectCreator } from '../preprocessing/DifficultyHitObjectCreator';
import { Skill } from './Skill';
import { Chart } from '../../utils/Chart';
import { Mod } from '../../mods/Mod';
import { ModFlashlight } from '../../mods/ModFlashlight';

/**
 * The base of difficulty calculation.
 */
export abstract class StarRating {
    /**
     * The calculated beatmap.
     */
    map: Beatmap = new Beatmap();

    /**
     * The difficulty objects of the beatmap.
     */
    readonly objects: DifficultyHitObject[] = [];

    /**
     * The modifications applied.
     */
    mods: Mod[] = [];

    /**
     * The total star rating of the beatmap.
     */
    total: number = 0;

    /**
     * The map statistics of the beatmap after modifications are applied.
     */
    stats: MapStats = new MapStats();

    /**
     * The strain peaks of aim difficulty.
     */
    aimStrainPeaks: number[] = [];

    /**
     * The strain peaks of speed difficulty.
     */
    speedStrainPeaks: number[] = [];

    /**
     * The strain peaks of flashlight difficulty.
     */
    flashlightStrainPeaks: number[] = [];

    protected readonly sectionLength: number = 400;
    protected abstract readonly difficultyMultiplier: number;

    /**
     * Calculates the star rating of the specified beatmap.
     *
     * The beatmap is analyzed in chunks of `sectionLength` duration.
     * For each chunk the highest hitobject strains are added to
     * a list which is then collapsed into a weighted sum, much
     * like scores are weighted on a user's profile.
     *
     * For subsequent chunks, the initial max strain is calculated
     * by decaying the previous hitobject's strain until the
     * beginning of the new chunk.
     *
     * The first object doesn't generate a strain
     * so we begin calculating from the second object.
     *
     * Also don't forget to manually add the peak strain for the last
     * section which would otherwise be ignored.
     */
    protected calculate(params: {
        /**
         * The beatmap to calculate.
         */
        map: Beatmap,

        /**
         * Applied modifications in osu!standard format.
         */
        mods?: Mod[],

        /**
         * Custom map statistics to apply custom speed multiplier as well as old statistics.
         */
        stats?: MapStats
    }, mode: modes): this {
        const map: Beatmap = this.map = params.map;
        if (!map) {
            throw new Error("A map must be defined");
        }

        const mod: Mod[] = this.mods = params.mods || this.mods;

        this.stats = new MapStats({
            cs: map.cs,
            ar: map.ar,
            od: map.od,
            hp: map.hp,
            mods: mod,
            speedMultiplier: params.stats?.speedMultiplier || 1,
            oldStatistics: params.stats?.oldStatistics || false
        }).calculate({mode: mode});

        this.generateDifficultyHitObjects(mode);
        this.calculateAll();

        return this;
    }

    /**
     * Generates difficulty hitobjects for this calculator.
     *
     * @param mode The gamemode to generate difficulty hitobjects for.
     */
    generateDifficultyHitObjects(mode: modes): void {
        this.objects.length = 0;
        this.objects.push(...new DifficultyHitObjectCreator().generateDifficultyObjects({
            objects: this.map.objects,
            circleSize: <number> this.stats.cs,
            speedMultiplier: this.stats.speedMultiplier,
            mode: mode
        }));
    }

    /**
     * Calculates the skills provided.
     *
     * @param skills The skills to calculate.
     */
    protected calculateSkills(...skills: Skill[]): void {
        this.objects.slice(1).forEach(h => {
            skills.forEach(skill => {
                skill.processInternal(h);
            });
        });
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    abstract calculateTotal(): void;

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    abstract calculateAll(): void;

    /**
     * Generates the strain chart of this beatmap and returns the chart as a buffer.
     *
     * @param beatmapsetID The beatmapset ID to get background image from. If omitted, the background will be plain white.
     * @param color The color of the graph.
     */
    getStrainChart(beatmapsetID?: number, color: string = "#000000"): Promise<Buffer|null> {
        return new Promise(async resolve => {
            if (this.aimStrainPeaks.length === 0 || this.speedStrainPeaks.length === 0 || this.aimStrainPeaks.length !== this.speedStrainPeaks.length) {
                return resolve(null);
            }

            const sectionLength: number = this.sectionLength * this.stats.speedMultiplier;
            const currentSectionEnd: number = Math.ceil(this.map.objects[0].startTime / sectionLength) * sectionLength;

            const strainInformations: {
                readonly time: number,
                readonly strain: number
            }[] = this.aimStrainPeaks.map((v, i) => {
                return {
                    time: (currentSectionEnd + sectionLength * i) / 1000,
                    strain: this.mods.some(m => m instanceof ModFlashlight) ?
                        (v + this.speedStrainPeaks[i] + this.flashlightStrainPeaks[i]) / 3 :
                        (v + this.speedStrainPeaks[i]) / 2
                };
            });

            const maxTime: number = strainInformations.at(-1)!.time ?? this.objects.at(-1)!.object.endTime / 1000;
            const maxStrain: number = Math.max(...strainInformations.map(v => {return v.strain;}), 1);

            const maxXUnits: number = 10;
            const maxYUnits: number = 10;

            const unitsPerTickX: number = Math.ceil(maxTime / maxXUnits / 10) * 10;
            const unitsPerTickY: number = Math.ceil(maxStrain / maxYUnits / 20) * 20;

            const chart: Chart = new Chart({
                graphWidth: 900,
                graphHeight: 250,
                minX: 0,
                minY: 0,
                maxX: Math.ceil(maxTime / unitsPerTickX) * unitsPerTickX,
                maxY: Math.ceil(maxStrain / unitsPerTickY) * unitsPerTickY,
                unitsPerTickX,
                unitsPerTickY,
                background: await loadImage(`https://assets.ppy.sh/beatmaps/${beatmapsetID}/covers/cover.jpg`).catch(() => {return undefined;}),
                xLabel: "Time",
                yLabel: "Strain",
                pointRadius: 0,
                xValueType: "time"
            });

            chart.drawArea(strainInformations.map(v => {return {x: v.time, y: v.strain};}), color);

            resolve(chart.getBuffer());
        });
    }

    /**
     * Returns a string representative of the class.
     */
    abstract toString(): string;

    /**
     * Creates skills to be calculated.
     */
    protected abstract createSkills(): Skill[];
}