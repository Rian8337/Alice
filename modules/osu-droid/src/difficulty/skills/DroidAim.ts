import { Spinner } from "../../beatmap/hitobjects/Spinner";
import { Vector2 } from "../../mathutil/Vector2";
import { DifficultyHitObject } from "../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export class DroidAim extends DroidSkill {
    protected readonly starsPerDouble: number = 1.1;
    protected readonly historyLength: number = 2;
    protected readonly decayExcessThreshold: number = 500;
    protected readonly baseDecay: number = 0.75;

    private readonly distanceConstant: number = 3.5;

    // Global constants for the different types of aim.
    private readonly snapStrainMultiplier: number = 23.727;
    private readonly flowStrainMultiplier: number = 30.727;
    private readonly sliderStrainMultiplier: number = 75;
    private readonly totalStrainMultiplier: number = 0.1675;

    protected strainValueOf(current: DifficultyHitObject): number {
        if (current.object instanceof Spinner || this.previous.length <= 1) {
            return 0;
        }

        // Since it is easier to get history, we take the previous[0] as our current, so we can see our "next".
        const nextObj: DifficultyHitObject = current;
        const currentObj: DifficultyHitObject = this.previous[0];
        const prevObj: DifficultyHitObject = this.previous[1];

        const nextVec: Vector2 = nextObj.distanceVector.divide(nextObj.strainTime);
        const currentVec: Vector2 = currentObj.distanceVector.divide(currentObj.strainTime);
        const prevVec: Vector2 = prevObj.distanceVector.divide(prevObj.strainTime);

        const snapStrain: number = this.snapStrainOf(prevObj, currentObj, prevVec, currentVec);
        const flowStrain: number = this.flowStrainOf(prevObj, currentObj, nextObj, prevVec, currentVec, nextVec);
        const sliderStrain: number = this.sliderStrainOf(prevObj);

        this.currentStrain *= this.computeDecay(current.strainTime);
        this.currentStrain += snapStrain * this.snapStrainMultiplier;
        this.currentStrain += flowStrain * this.flowStrainMultiplier;
        this.currentStrain += sliderStrain * this.sliderStrainMultiplier;

        return this.totalStrainMultiplier * this.currentStrain;
    }

    protected saveToHitObject(current: DifficultyHitObject): void {
        current.aimStrain = this.strains[this.strains.length - 1]; 
    }

    /**
     * Calculates the difficulty to flow from the previous hitobject the current hitobject.
     */
    private flowStrainOf(prev: DifficultyHitObject, current: DifficultyHitObject, next: DifficultyHitObject, prevVec: Vector2, currentVec: Vector2, nextVec: Vector2): number {
        const observedDistance: Vector2 = currentVec.subtract(prevVec.scale(0.1));

        const prevAngularMomentumChange: number = Math.abs(current.angle * currentVec.length - prev.angle * prevVec.length);
        const nextAngularMomentumChange: number = Math.abs(current.angle * currentVec.length - next.angle * nextVec.length);

        // Buff for changes in angular momentum, but only if the momentum change doesnt equal the previous.
        const angularMomentumChange: number = Math.sqrt(Math.min(currentVec.length, prevVec.length) * Math.abs(nextAngularMomentumChange - prevAngularMomentumChange) / (2 * Math.PI));

        // Reward for accelerative changes in momentum.
        const momentumChange: number = Math.sqrt(Math.max(0, prevVec.length - currentVec.length) * Math.min(currentVec.length, prevVec.length));

        let strain: number = current.flowProbability * (observedDistance.length
            + Math.max(
                momentumChange * (0.5 + 0.5 * prev.flowProbability),
                angularMomentumChange * prev.flowProbability
            )
        );

        // Buff high BPM slightly.
        strain *= Math.min(current.strainTime / (current.strainTime - 10), prev.strainTime / (prev.strainTime - 10));

        return strain;
    }

    /**
     * Calculates the difficulty to snap from the previous hitobject to the current hitobject.
     */
    private snapStrainOf(prev: DifficultyHitObject, current: DifficultyHitObject, prevVec: Vector2, currentVec: Vector2): number {
        const currentVector: Vector2 = currentVec.scale(this.snapScaling(current.jumpDistance / 100));
        const prevVector: Vector2 = prevVec.scale(this.snapScaling(prev.jumpDistance / 100));

        const observedDistance: Vector2 = currentVector.add(prevVector.scale(0.35));

        let strain: number = observedDistance.length * current.snapProbability;

        // Buff high BPM slightly.
        strain *= Math.min(current.strainTime / (current.strainTime - 20), prev.strainTime / (prev.strainTime - 20));

        return strain;
    }

    /**
     * Calculates the estimated difficulty associated with the slider movement from the previous hitobject to the current hitobject.
     */
    private sliderStrainOf(prev: DifficultyHitObject): number {
        return prev.travelDistance / prev.strainTime;
    }

    /**
     * Alters the distance traveled for snapping to match the results from Fitts' law.
     */
    private snapScaling(distance: number): number {
        if (distance <= this.distanceConstant) {
            return 1;
        }

        return (this.distanceConstant +
            Math.log(1 + (distance - this.distanceConstant) / Math.SQRT2) / Math.log(2)
        ) / distance;
    }
}