import { Beatmap } from '../beatmap/Beatmap';
import { StandardDiffHitObject } from './preprocessing/StandardDiffHitObject';
import { MapStats } from '../utils/MapStats';
import { mods } from '../utils/mods';
import { modes } from '../constants/modes';
import { objectTypes } from '../constants/objectTypes';
import { Vector } from '../utils/Vector';

interface DifficultyValue {
    difficulty: number;
    total: number;
}

// (internal)
// difficulty calculation constants
const DIFF_SPEED: number = 0;
const DIFF_AIM: number = 1;
const SINGLE_SPACING: number = 125;
const DECAY_BASE: [number, number] = [0.3, 0.15];
const WEIGHT_SCALING: [number, number] = [1400, 26.25];
const DECAY_WEIGHT: number = 0.9;
const STRAIN_STEP: number = 400;
const CIRCLESIZE_BUFF_THRESHOLD: number = 30;
const STAR_SCALING_FACTOR: number = 0.0675;
const PLAYFIELD_SIZE: Vector = new Vector({x: 512, y: 384});
const PLAYFIELD_CENTER: Vector = Vector.multiply(PLAYFIELD_SIZE, new Vector({x: 0.5, y: 0.5}));
const DROID_EXTREME_SCALING_FACTOR = 0.4;
const EXTREME_SCALING_FACTOR = 0.5;

// (internal)
// spacing weight constants for each difficulty type
// ~200 BPM 1/4 streams
const MIN_SPEED_BONUS: number = 75;

// ~280BPM 1/4 streams - edit to fit droid
const DROID_MAX_SPEED_BONUS: number = 53.0;

// ~330 BPM 1/4 streams
const MAX_SPEED_BONUS: number = 45;

const ANGLE_BONUS_SCALE: number = 90;
const AIM_TIMING_THRESHOLD: number = 107;
const SPEED_ANGLE_BONUS_BEGIN: number = 5 * Math.PI / 6;
const AIM_ANGLE_BONUS_BEGIN: number = Math.PI / 3;

/**
 * An osu!standard difficulty calculator.
 *
 * Does not account for sliders because slider calculations are expensive and not worth the small accuracy increase.
 */
export class StandardDiff {
    /**
     * The difficulty objects of the beatmap.
     */
    public objects: StandardDiffHitObject[];

    /**
     * The calculated beatmap.
     */
    public map?: Beatmap;

    /**
     * The modifications applied to the beatmap.
     */
    public mods: string;

    /**
     * Interval threshold for singletaps in milliseconds.
     */
    public singletapThreshold: number;

    /**
     * The overall star rating of the beatmap.
     */
    public total: number;

    /**
     * The aim star rating of the beatmap.
     */
    public aim: number;

    /**
     * The speed star rating of the beatmap.
     */
    public speed: number;

    /**
     * The aim difficulty of the beatmap.
     */
    public aimDifficulty: number;
    
    /**
     * The speed difficulty of the beatmap.
     */
    public speedDifficulty: number;
    
    /**
     * The length bonus given by aim difficulty.
     */
    public aimLengthBonus: number;

    /**
     * The length bonus given by speed difficulty
     */
    public speedLengthBonus: number;

    /**
     * Number of notes that are seen as singletaps by the difficulty calculator.
     */
    public singles: number;

    /**
     * Number of notes that are faster than the interval given in `calculate()`. These singletap statistics are not required in star rating, but they are a free byproduct of the calculation which could be useful.
     */
    public singlesThreshold: number;

    constructor() {
        this.objects = [];
        this.map = undefined;
        this.mods = "";
        this.singletapThreshold = 125;

        this.total = 0;
        this.aim = 0;
        this.speed = 0;
        this.aimDifficulty = 0;
        this.speedDifficulty = 0;
        this.aimLengthBonus = 0;
        this.speedLengthBonus = 0;
        this.singles = 0;
        this.singlesThreshold = 0;
    }

    /**
     * Calculates the star rating of a beatmap.
     */
    calculate(params: {
        map: Beatmap,
        mods?: string,
        singletapThreshold?: number,
        mode?: modes,
        stats?: MapStats
    }): StandardDiff {
        const map: Beatmap = this.map = params.map || this.map;
        if (!map) {
            throw new TypeError("No beatmap given");
        }
        const mod: string = this.mods = params.mods || this.mods;
        const convertedMod: number = mods.modbitsFromString(mod);
        const singletapThreshold: number = this.singletapThreshold
            = params.singletapThreshold || this.singletapThreshold;

        const mode: modes = params.mode || modes.osu;

        // apply mods to the beatmap's stats
        const stats: MapStats = new MapStats({
            cs: map.cs,
            mods: mod,
            speedMultiplier: params.stats?.speedMultiplier || 1
        }).calculate({mode: mode});

        this.initializeObjects(map, stats.cs as number);

        const speed = this.calculateIndividual(mode, DIFF_SPEED, this.objects, stats.speedMultiplier);
        this.speed = speed.difficulty;
        this.speedDifficulty = speed.total;

        const aim = this.calculateIndividual(mode, DIFF_AIM, this.objects, stats.speedMultiplier);
        this.aim = aim.difficulty;
        this.aimDifficulty = aim.total;

        this.aimLengthBonus = this.lengthBonus(this.aim, this.aimDifficulty);
        this.speedLengthBonus = this.lengthBonus(this.speed, this.speedDifficulty);
        this.aim = Math.sqrt(this.aim) * STAR_SCALING_FACTOR;
        this.speed = Math.sqrt(this.speed) * STAR_SCALING_FACTOR;

        if (convertedMod & mods.osuMods.td || mode === modes.droid) {
            this.aim = Math.pow(this.aim, 0.8);
        }

        this.total = this.aim + this.speed;

        // total stars mixes speed and aim in such a way that
        // heavily aim or speed focused maps get a bonus
        switch (mode) {
            case modes.droid:
                this.total += Math.abs(this.speed - this.aim) * DROID_EXTREME_SCALING_FACTOR;
                break;
            case modes.osu:
                this.total += Math.abs(this.speed - this.aim) * EXTREME_SCALING_FACTOR;
        }

        for (let i: number = 1; i < this.objects.length; ++i) {
            const obj: StandardDiffHitObject = this.objects[i];
            const prev: StandardDiffHitObject = this.objects[i - 1];
            if (obj.isSingle) {
                ++this.singles;
            }
            if (!(obj.type & (objectTypes.slider | objectTypes.circle))) {
                continue;
            }
            const interval: number = (obj.time - prev.time) / stats.speedMultiplier;
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

    /**
     * Initialize difficulty objects and populate it with the normalized position of the beatmap's objects.
     */
    private initializeObjects(map: Beatmap, circleSize: number) {
        const scalingVector: Vector = this.normalizerVector(circleSize);
        const normalizedCenter: Vector = Vector.multiply(PLAYFIELD_CENTER, scalingVector);

        for (let i: number = 0; i < map.objects.length; ++i) {
            const obj: StandardDiffHitObject = new StandardDiffHitObject(map.objects[i]);
            if (obj.type & objectTypes.spinner) {
                obj.normPos = normalizedCenter;
            } else if (obj.type & (objectTypes.slider | objectTypes.circle)) {
                obj.normPos = Vector.multiply(obj.pos, scalingVector);
            }

            if (i >= 2) {
                const prev1: StandardDiffHitObject = this.objects[i - 1];
                const prev2: StandardDiffHitObject = this.objects[i - 2];
                const v1: Vector = Vector.subtract(prev2.normPos, prev1.normPos);
                const v2: Vector = Vector.subtract(obj.normPos, prev1.normPos);
                const dot: number = Vector.dot(v1, v2);
                const det: number = v1.x * v2.y - v1.y * v2.x;
                obj.angle = Math.abs(Math.atan2(det, dot));
            } else {
                obj.angle = null;
            }
            this.objects.push(obj);
        }
    }

    /**
     * Creates a scaling vector that normalizes positions.
     * 
     * Positions are normalized on circle radius so that we can calculate as if everything was the same circle size.
     */
    private normalizerVector(circleSize: number): Vector {
        const radius: number = (PLAYFIELD_SIZE.x / 16) * (1 - 0.7 * (circleSize - 5) / 5);
        let scalingFactor: number = 52 / radius;

        // high circle size (small CS) bonus
        if (radius < CIRCLESIZE_BUFF_THRESHOLD) {
            scalingFactor *= 1.0
                + Math.min(CIRCLESIZE_BUFF_THRESHOLD - radius, 5) / 50;
        }

        return new Vector({x: scalingFactor, y: scalingFactor});
    }

    /**
     * Calculates a specific type of difficulty.
     * 
     * The map is analyzed in chunks of STRAIN_STEP duration.
     * For each chunk the highest hitobject strains are added to
     * a list which is then collapsed into a weighted sum, much
     * like scores are weighted on a user's profile.
     * 
     * For subsequent chunks, the initial max strain is calculated
     * by decaying the previous hitobject's strain until the
     * beginning of the new chunk.
     * 
     * The first object doesn't generate a strain
     * so we begin with an incremented interval end.
     * 
     * Also don't forget to manually add the peak strain for the last
     * section which would otherwise be ignored.
     */
    private calculateIndividual(mode: modes, type: number, difficultyObjects: StandardDiffHitObject[], speedMultiplier: number): DifficultyValue {
        const strains: number[] = [];
        const strainStep: number = STRAIN_STEP * speedMultiplier;
        let intervalEnd: number = Math.ceil(difficultyObjects[0].time / strainStep) * strainStep;
        let maxStrain: number = 0;
        let i: number;

        for (i = 0; i < difficultyObjects.length; ++i) {
            if (i > 0) {
                this.calculateStrain(mode, type, difficultyObjects[i], difficultyObjects[i - 1], speedMultiplier);
            }
            while (difficultyObjects[i].time > intervalEnd) {
                strains.push(maxStrain);
                if (i > 0) {
                    const decay = Math.pow(DECAY_BASE[type],
                        (intervalEnd - difficultyObjects[i - 1].time) / 1000);
                    maxStrain = difficultyObjects[i - 1].strains[type] * decay;
                } else {
                    maxStrain = 0;
                }
                intervalEnd += strainStep;
            }
            maxStrain = Math.max(maxStrain, difficultyObjects[i].strains[type]);
        }

        strains.push(maxStrain);

        let weight: number = 1;
        let total: number = 0;
        let difficulty: number = 0;

        strains.sort((a, b) => {return b - a;});

        for (i = 0; i < strains.length; ++i) {
            total += Math.pow(strains[i], 1.2);
            difficulty += strains[i] * weight;
            weight *= DECAY_WEIGHT;
        }

        return {difficulty: difficulty, total: total};
    }

    /**
     * Calculates a single strain and store it in the current hit object.
     */
    private calculateStrain(mode: modes, type: number, difficultyObject: StandardDiffHitObject, prevDifficultyObject: StandardDiffHitObject, speedMultiplier: number): void {
        let value: number = 0;
        const timeElapsed: number = (difficultyObject.time - prevDifficultyObject.time) / speedMultiplier;
        const decay: number = Math.pow(DECAY_BASE[type],
            timeElapsed / 1000);

        difficultyObject.deltaTime = timeElapsed;

        if (difficultyObject.type & (objectTypes.slider | objectTypes.circle)) {
            const distance: number = Vector.getLength(Vector.subtract(difficultyObject.normPos, prevDifficultyObject.normPos));
            difficultyObject.drawDistance = distance;
            if (type === DIFF_SPEED) {
                difficultyObject.isSingle = distance > SINGLE_SPACING;
            }
            value = this.spacingWeight(mode, type, distance, timeElapsed,
                prevDifficultyObject.drawDistance, prevDifficultyObject.deltaTime, difficultyObject.angle);
            value *= WEIGHT_SCALING[type];
        }

        difficultyObject.strains[type] = prevDifficultyObject.strains[type] * decay + value;
    }

    /**
     * Calculate spacing weight for a difficulty type.
     */
    private spacingWeight(mode: modes, type: number, distance: number, deltaTime: number, prevDistance: number, prevDeltaTime: number, angle: number|null): number {
        let angleBonus: number;
        const strainTime: number = Math.max(deltaTime, 50);

        switch (type) {
            case DIFF_AIM: {
                const prevStrainTime: number = Math.max(prevDeltaTime, 50);
                let result: number = 0;

                if (angle !== null && angle > AIM_ANGLE_BONUS_BEGIN) {
                    angleBonus = Math.sqrt(
                        Math.max(prevDistance - ANGLE_BONUS_SCALE, 0) *
                        Math.pow(Math.sin(angle - AIM_ANGLE_BONUS_BEGIN), 2) *
                        Math.max(distance - ANGLE_BONUS_SCALE, 0)
                    );
                    result = 1.5 * Math.pow(Math.max(0, angleBonus), 0.99) /
                        Math.max(AIM_TIMING_THRESHOLD, prevStrainTime);
                }
                const weightedDistance: number = Math.pow(distance, 0.99);
                return Math.max(
                    result + weightedDistance / Math.max(AIM_TIMING_THRESHOLD, strainTime),
                    weightedDistance / strainTime
                );
            }
            case DIFF_SPEED: {
                distance = Math.min(distance, SINGLE_SPACING);
                switch (mode) {
                    case modes.droid:
                        deltaTime = Math.max(deltaTime, DROID_MAX_SPEED_BONUS);
                        break;
                    case modes.osu:
                        deltaTime = Math.max(deltaTime, MAX_SPEED_BONUS);
                        break;
                }
                let speedBonus: number = 1;

                if (deltaTime < MIN_SPEED_BONUS) {
                    switch (mode) {
                        case modes.droid:
                            speedBonus += Math.pow((MIN_SPEED_BONUS - deltaTime) / 50, 2);
                            break;
                        case modes.osu:
                            speedBonus += Math.pow((MIN_SPEED_BONUS - deltaTime) / 40, 2);
                            break;
                    }
                }

                angleBonus = 1;
                if (angle !== null && angle < SPEED_ANGLE_BONUS_BEGIN) {
                    const s: number = Math.sin(1.5 * (SPEED_ANGLE_BONUS_BEGIN - angle));
                    angleBonus += Math.pow(s, 2) / 3.57;

                    if (angle < Math.PI / 2) {
                        angleBonus = 1.28;
                        
                        if (distance < ANGLE_BONUS_SCALE && angle < Math.PI / 4) {
                            angleBonus += (1 - angleBonus) *
                            Math.min((ANGLE_BONUS_SCALE - distance) / 10, 1);
                        } else if (distance < ANGLE_BONUS_SCALE) {
                            angleBonus += (1 - angleBonus) *
                                Math.min((ANGLE_BONUS_SCALE - distance) / 10, 1) *
                                Math.sin((Math.PI / 2 - angle) * 4 / Math.PI);
                        }
                    }
                }
                return (
                    (1 + (speedBonus - 1) * 0.75) * angleBonus *
                    (0.95 + speedBonus * Math.pow(distance / SINGLE_SPACING, 3.5))
                ) / strainTime;
            }
        }
        throw {
            name: "NotImplementedError",
            message: "This difficulty type does not exist"
        }
    }
}