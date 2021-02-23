import { objectTypes } from '../constants/objectTypes';
import { Beatmap } from '../beatmap/Beatmap';
import { modes } from '../constants/modes';
import { MapStats } from '../utils/MapStats';
import { mods } from '../utils/mods';
import { DifficultyHitObject } from '../beatmap/hitobjects/DifficultyHitObject';
import { DifficultyHitObjectCreator } from '../difficulty/preprocessing/DifficultyHitObjectCreator';
import { Aim } from './skills/Aim';
import { Speed } from './skills/Speed';
import { DifficultyValue } from './skills/Skill';

export class StarRating {
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

    private readonly sectionLength: number = 400;
    private readonly difficultyMultiplier: number = 0.0675;

    /**
     * Calculates the star rating of the specified beatmap.
     * 
     * The map is analyzed in chunks of `sectionLength` duration.
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

        const mode: modes = params.mode || modes.osu;
        const convertedMod: number = mods.modbitsFromString(mod);

        const stats: MapStats = new MapStats({
            cs: map.cs,
            mods: mod,
            speedMultiplier: params.stats?.speedMultiplier || 1,
            oldStatistics: params.stats?.oldStatistics || false
        }).calculate({mode: mode});

        this.objects.push(...new DifficultyHitObjectCreator().generateDifficultyObjects({
            objects: map.objects,
            circleSize: stats.cs as number,
            speedMultiplier: stats.speedMultiplier
        }));

        const aimSkill: Aim = new Aim();
        const speedSkill: Speed = new Speed();

        const sectionLength: number = this.sectionLength * stats.speedMultiplier;
        let currentSectionEnd: number = Math.ceil(map.objects[0].startTime / sectionLength) * sectionLength;

        this.objects.forEach(h => {
            while (h.object.startTime > currentSectionEnd) {
                aimSkill.saveCurrentPeak();
                aimSkill.startNewSectionFrom(currentSectionEnd);

                speedSkill.saveCurrentPeak();
                speedSkill.startNewSectionFrom(currentSectionEnd);

                currentSectionEnd += sectionLength;
            }

            aimSkill.process(h);
            speedSkill.process(h);
        });

        aimSkill.saveCurrentPeak();
        speedSkill.saveCurrentPeak();

        const aimRating: DifficultyValue = aimSkill.difficultyValue();
        const speedRating: DifficultyValue = speedSkill.difficultyValue();

        this.aim = Math.sqrt(aimRating.difficulty) * this.difficultyMultiplier;
        this.aimDifficulty = aimRating.total;
        this.aimLengthBonus = this.lengthBonus(aimRating.difficulty, this.aimDifficulty);

        this.speed = Math.sqrt(speedRating.difficulty) * this.difficultyMultiplier;
        this.speedDifficulty = speedRating.total;
        this.speedLengthBonus = this.lengthBonus(speedRating.difficulty, this.difficultyMultiplier);

        if (convertedMod & mods.osuMods.td || mode === modes.droid) {
            this.aim = Math.pow(this.aim, 0.8);
        }

        this.total = this.aim + this.speed;

        // total stars mixes speed and aim in such a way that
        // heavily aim or speed focused maps get a bonus
        switch (mode) {
            case modes.droid:
                this.total += Math.abs(this.speed - this.aim) * 0.4;
                break;
            case modes.osu:
                this.total += Math.abs(this.speed - this.aim) * 0.5;
        }

        for (let i = 1; i < this.objects.length; ++i) {
            const obj: DifficultyHitObject = this.objects[i];
            const prev: DifficultyHitObject = this.objects[i - 1];

            if (obj.isSingle) {
                ++this.singles;
            }

            if (!(obj.object.type & (objectTypes.slider | objectTypes.circle))) {
                continue;
            }

            const interval: number = (obj.object.startTime - prev.object.startTime) / stats.speedMultiplier;
            if (interval >= singletapThreshold) {
                ++this.singlesThreshold;
            }
        }

        return this;
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