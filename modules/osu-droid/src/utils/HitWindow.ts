/**
 * An interface for defining hit window values.
 */
interface HitWindow {
    /**
     * The overall difficulty of this hit window.
     */
    overallDifficulty: number;

    /**
     * Gets the threshold for 300 (great) hit result.
     */
    hitWindowFor300(isPrecise?: boolean): number;

    /**
     * Gets the threshold for 100 (good) hit result.
     */
    hitWindowFor100(isPrecise?: boolean): number;

    /**
     * Gets the threshold for 50 (meh) hit result.
     */
    hitWindowFor50(isPrecise?: boolean): number;
}

/**
 * Represents the hit window of osu!droid.
 */
export class DroidHitWindow implements HitWindow {
    public readonly overallDifficulty: number;

    constructor(overallDifficulty: number) {
        this.overallDifficulty = overallDifficulty;
    }

    hitWindowFor300(isPrecise?: boolean): number {
        if (isPrecise) {
            return 55 + 6 * (5 - this.overallDifficulty);
        } else {
            return 75 + 5 * (5 - this.overallDifficulty);
        }
    }

    hitWindowFor100(isPrecise?: boolean): number {
        if (isPrecise) {
            return 120 + 8 * (5 - this.overallDifficulty);
        } else {
            return 150 + 10 * (5 - this.overallDifficulty);
        }
    }

    hitWindowFor50(isPrecise?: boolean): number {
        if (isPrecise) {
            return 180 + 10 * (5 - this.overallDifficulty);
        } else {
            return 250 + 10 * (5 - this.overallDifficulty);
        }
    }
}

/**
 * Represents the hit window of osu!standard.
 */
export class OsuHitWindow implements HitWindow {
    public readonly overallDifficulty: number;

    constructor(overallDifficulty: number) {
        this.overallDifficulty = overallDifficulty;
    }

    hitWindowFor300(): number {
        return 160 - 12 * this.overallDifficulty;
    }

    hitWindowFor100(): number {
        return 280 - 16 * this.overallDifficulty;
    }

    hitWindowFor50(): number {
        return 400 - 20 * this.overallDifficulty;
    }
}