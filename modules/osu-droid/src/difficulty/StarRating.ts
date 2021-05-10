import { loadImage } from 'canvas';
import { objectTypes } from '../constants/objectTypes';
import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { DifficultyHitObject } from '../beatmap/hitobjects/DifficultyHitObject';
import { DifficultyHitObjectCreator } from '../difficulty/preprocessing/DifficultyHitObjectCreator';
import { Aim } from './skills/Aim';
import { Speed } from './skills/Speed';
import { Skill, DifficultyValue } from './skills/Skill';
import { Chart } from '../utils/Chart';

export class StarRating {
    /**
     * The calculated beatmap.
     */
    map: Beatmap = new Beatmap();

    /**
     * The gamemode this calculator is calculating for.
     */
    mode: modes = modes.osu;

    /**
     * The difficulty objects of the beatmap.
     */
    readonly objects: DifficultyHitObject[] = [];

    /**
     * The modifications applied.
     */
    mods: string = "";

    /**
     * The aim star rating of the beatmap.
     */
    aim: number = 0;

    /**
     * The speed star rating of the beatmap.
     */
    speed: number = 0;

    /**
     * The total star rating of the beatmap.
     */
    total: number = 0;

    /**
     * The aim difficulty of the beatmap.
     */
    aimDifficulty: number = 0;

    /**
     * The speed difficulty of the beatmap.
     */
    speedDifficulty: number = 0;
    
    /**
     * Length bonus given by aim difficulty.
     */
    aimLengthBonus: number = 0;

    /**
     * Length bonus given by speed difficulty.
     */
    speedLengthBonus: number = 0;

    /**
     * Interval threshold for singletaps in milliseconds.
     */
    singletapThreshold: number = 125;

    /**
     * Number of notes that are seen as singletaps by the difficulty calculator.
     */
    singles: number = 0;

    /**
     * Number of notes that are faster than the interval given in `calculate()`. These singletap statistics are not required in star rating, but they are a free byproduct of the calculation which could be useful.
     */
    singlesThreshold: number = 0;

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
    
    private readonly sectionLength: number = 400;
    private readonly difficultyMultiplier: number = 0.0675;

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
    calculate(params: {
        /**
         * The beatmap to calculate.
         */
        map: Beatmap,

        /**
         * The gamemode to calculate.
         */
        mode?: modes,

        /**
         * Applied modifications in osu!standard format.
         */
        mods?: string,

        /**
         * Interval threshold for singletaps in milliseconds.
         */
        singletapThreshold?: number,

        /**
         * Custom map statistics to apply custom speed multiplier as well as old statistics.
         */
        stats?: MapStats
    }): StarRating {
        const map: Beatmap = this.map = params.map;
        if (!map) {
            throw new Error("A map must be defined");
        }

        const mod: string = this.mods = params.mods || this.mods;
        const singletapThreshold: number = this.singletapThreshold =
            params.singletapThreshold || this.singletapThreshold;

        this.mode = params.mode || modes.osu;

        this.stats = new MapStats({
            cs: map.cs,
            mods: mod,
            speedMultiplier: params.stats?.speedMultiplier || 1,
            oldStatistics: params.stats?.oldStatistics || false
        }).calculate({mode: this.mode});

        this.generateDifficultyHitObjects();
        this.calculateAll();

        for (let i = 1; i < this.objects.length; ++i) {
            const obj: DifficultyHitObject = this.objects[i];
            const prev: DifficultyHitObject = this.objects[i - 1];

            if (obj.isSingle) {
                ++this.singles;
            }

            if (!(obj.object.type & (objectTypes.slider | objectTypes.circle))) {
                continue;
            }

            const interval: number = (obj.object.startTime - prev.object.startTime) / this.stats.speedMultiplier;
            if (interval >= singletapThreshold) {
                ++this.singlesThreshold;
            }
        }

        return this;
    }

    /**
     * Generates difficulty hitobjects for this calculator.
     * 
     * @param stats Custom map statistics to apply custom speed multiplier as well as old statistics.
     */
    generateDifficultyHitObjects(): void {
        this.objects.length = 0;
        this.objects.push(...new DifficultyHitObjectCreator().generateDifficultyObjects({
            objects: this.map.objects,
            circleSize: this.stats.cs as number,
            speedMultiplier: this.stats.speedMultiplier,
            mode: this.mode
        }));
    }

    /**
     * Calculates the skills provided.
     * 
     * @param skills The skills to calculate.
     */
    calculateSkills(skills: Skill[]): void {
        const sectionLength: number = this.sectionLength * this.stats.speedMultiplier;
        let currentSectionEnd: number = Math.ceil(this.map.objects[0].startTime / sectionLength) * sectionLength;

        this.objects.forEach(h => {
            while (h.object.startTime > currentSectionEnd) {
                skills.forEach(skill => {
                    skill.saveCurrentPeak();
                    skill.startNewSectionFrom(currentSectionEnd / this.stats.speedMultiplier);
                });
                currentSectionEnd += sectionLength;
            }

            skills.forEach(skill => {
                skill.process(h);
            });
        });

        skills.forEach(skill => {
            skill.saveCurrentPeak();
        });
    }

    /**
     * Calculates the aim star rating of the beatmap and stores it in this instance.
     */
    calculateAim(): void {
        const aimSkill: Aim = new Aim();
        this.calculateSkills([aimSkill]);
        const aimRating: DifficultyValue = aimSkill.difficultyValue();

        this.aimStrainPeaks = aimSkill.unsortedStrainPeaks;

        this.aim = Math.sqrt(aimRating.difficulty) * this.difficultyMultiplier;
        this.aimDifficulty = aimRating.total;
        this.aimLengthBonus = this.lengthBonus(aimRating.difficulty, aimRating.total);

        if (this.mods.includes("TD") || this.mode === modes.droid) {
            this.aim = Math.pow(this.aim, 0.8);
        }
    }

    /**
     * Calculates the speed star rating of the beatmap and stores it in this instance.
     */
    calculateSpeed(): void {
        const speedSkill: Speed = new Speed();
        this.calculateSkills([speedSkill]);
        const speedRating: DifficultyValue = speedSkill.difficultyValue();

        this.speedStrainPeaks = speedSkill.unsortedStrainPeaks;

        this.speed = Math.sqrt(speedRating.difficulty) * this.difficultyMultiplier;
        this.speedDifficulty = speedRating.total;
        this.speedLengthBonus = this.lengthBonus(speedRating.difficulty, speedRating.total);
    }

    /**
     * Calculates the total star rating of the beatmap and stores it in this instance.
     */
    calculateTotal(): void {
        this.total = this.aim + this.speed;

        // Total stars mixes speed and aim in such a way that
        // heavily aim or speed focused maps get a bonus
        switch (this.mode) {
            case modes.droid:
                this.total += Math.abs(this.speed - this.aim) * 0.4;
                break;
            case modes.osu:
                this.total += Math.abs(this.speed - this.aim) * 0.5;
        }
    }

    /**
     * Calculates every star rating of the beatmap and stores it in this instance.
     */
    calculateAll(): void {
        const aimSkill: Aim = new Aim();
        const speedSkill: Speed = new Speed();
        this.calculateSkills([aimSkill, speedSkill]);

        const aimRating: DifficultyValue = aimSkill.difficultyValue();
        const speedRating: DifficultyValue = speedSkill.difficultyValue();

        this.aimStrainPeaks = aimSkill.unsortedStrainPeaks;
        this.speedStrainPeaks = speedSkill.unsortedStrainPeaks;

        this.aim = Math.sqrt(aimRating.difficulty) * this.difficultyMultiplier;
        this.aimDifficulty = aimRating.total;
        this.aimLengthBonus = this.lengthBonus(aimRating.difficulty, aimRating.total);

        this.speed = Math.sqrt(speedRating.difficulty) * this.difficultyMultiplier;
        this.speedDifficulty = speedRating.total;
        this.speedLengthBonus = this.lengthBonus(speedRating.difficulty, speedRating.total);

        if (this.mods.includes("TD") || this.mode === modes.droid) {
            this.aim = Math.pow(this.aim, 0.8);
        }

        this.calculateTotal();
    }

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
                    strain: (v + this.speedStrainPeaks[i]) / 2
                };
            });

            const maxTime: number = strainInformations[strainInformations.length - 1].time;
            const maxStrain: number = Math.max(...strainInformations.map(v => {return v.strain;}));

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
    toString(): string {
        return (
            this.total.toFixed(2) + " stars (" + this.aim.toFixed(2) +
            " aim, " + this.speed.toFixed(2) + " speed)"
        );
    }

    /**
     * Calculates the length bonus of a difficulty aspect in a beatmap.
     */
    private lengthBonus(stars: number, difficulty: number): number {
        return 0.32 + 0.5 * (Math.log10(difficulty + stars) - Math.log10(stars));
    }
}