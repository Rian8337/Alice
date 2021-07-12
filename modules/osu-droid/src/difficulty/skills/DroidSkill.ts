import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { Skill } from "../base/Skill";

/**
 * Used to processes strain values of difficulty hitobjects, keep track of strain levels caused by the processed objects
 * and to calculate a final difficulty value representing the difficulty of hitting all the processed objects.
 */
export abstract class DroidSkill extends Skill {
    readonly strains: number[] = [];
    private readonly times: number[] = [];
    private readonly targetFcPrecision: number = 0.01;
    private targetFcTime: number = 30 * 60 * 1000; // Estimated time it takes us to FC (30 minutes)

    protected abstract readonly decayExcessThreshold: number;
    protected abstract readonly baseDecay: number;

    protected abstract readonly starsPerDouble: number;

    protected currentStrain: number = 1;

    protected get difficultyExponent(): number {
        return 1 / Math.log2(this.starsPerDouble);
    }

    /**
     * The calculated strain value associated with this difficulty hitobject.
     * 
     * @param current The current difficulty hitobject being processed.
     */
    protected abstract strainValueOf(current: DifficultyHitObject): number;

    /**
     * Saves the current strain to a hitobject.
     */
    protected abstract saveToHitObject(current: DifficultyHitObject): void;

    /**
     * Utility to decay strain over a period of deltaTime.
     * 
     * @param deltaTime The time between objects.
     */
    protected computeDecay(deltaTime: number): number {
        return deltaTime < this.decayExcessThreshold ?
            this.baseDecay :
            // Beyond 500 MS (or whatever decayExcessThreshold is), we decay geometrically to avoid keeping strain going over long breaks.
            Math.pow(Math.pow(this.baseDecay, Math.min(deltaTime, this.decayExcessThreshold)), deltaTime);
    }

    protected process(current: DifficultyHitObject): void {
        this.strains.push(this.strainValueOf(current));
        this.times.push(current.startTime);
        this.saveToHitObject(current);
    }

    difficultyValue(): number {
        if (this.strains.length === 0) {
            return 0;
        }

        let starRating: number = 0;

        // Math here preserves the property that two notes of equal difficulty x, we have their summed difficulty = x * starsPerDouble
        // This also applies to two sets of notes with equal difficulty.
        for (const strain of this.strains) {
            starRating += Math.pow(strain, this.difficultyExponent);
        }

        return this.fcTimeSkillLevel(Math.pow(starRating, 1 / this.difficultyExponent));
    }

    /**
     * The probability of a player of the given skill to full combo a map of the given difficulty.
     * 
     * @param skill The skill level of the player.
     * @param difficulty The difficulty of a range of notes.
     */
    private fcProbability(skill: number, difficulty: number): number {
        return Math.exp(-Math.pow(difficulty / Math.max(1e-10, skill), this.difficultyExponent));
    }

    /**
     * Approximates the skill level of a player that can FC a map with the given difficulty,
     * if their probability of success in doing so is equal to the given probability.
     */
    private skillLevel(probability: number, difficulty: number): number {
        return difficulty * Math.pow(-Math.log(probability), -1 / this.difficultyExponent);
    }

    /**
     * Approximates the amount of time spent straining during the beatmap. Used for scaling expected target time.
     */
    private expectedTargetTime(totalDifficulty: number): number {
        let targetTime: number = 0;

        for (let i = 1; i < this.strains.length; ++i) {
            targetTime += Math.min(2000, this.times[i] - this.times[i - 1]) * (this.strains[i] / totalDifficulty);
        }

        return targetTime;
    }

    private expectedFcTime(skill: number): number {
        let lastTimestamp: number = this.times[0] - 5; // time taken to retry map
        let fcTime: number = 0;

        for (let i = 0; i < this.strains.length; ++i) {
            const dt: number = this.times[i] - lastTimestamp;
            lastTimestamp = this.times[i];
            fcTime = (fcTime + dt) / this.fcProbability(skill, this.strains[i]);
        }

        return fcTime - (this.times[this.times.length - 1] - this.times[0]);
    }

    /**
     * The final estimated skill level necessary to full combo the entire beatmap.
     * 
     * @param totalDifficulty The total difficulty of all objects in the beatmap.
     */
    private fcTimeSkillLevel(totalDifficulty: number): number {
        let lengthEstimate: number = 0.4 * (this.times[this.times.length - 1] - this.times[0]);
        // For every minute of straining time past 1 minute, add 45 mins to estimated time to FC.
        this.targetFcTime += 45 * Math.max(0, this.expectedTargetTime(totalDifficulty) - 60000);

        let fcProb: number = lengthEstimate / this.targetFcTime;
        let skill: number = this.skillLevel(fcProb, totalDifficulty);

        for (let i = 0; i < 5; ++i) {
            const fcTime: number = this.expectedFcTime(skill);
            lengthEstimate = fcTime * fcProb;
            fcProb = lengthEstimate / this.targetFcTime;
            skill = this.skillLevel(fcProb, totalDifficulty);

            if (Math.abs(fcTime - this.targetFcTime) < this.targetFcPrecision * this.targetFcTime) {
                // Enough precision
                break;
            }
        }

        return skill;
    }
}