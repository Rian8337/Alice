abstract class HitWindow {
    /**
     * The overall difficulty of this hit window.
     */
    readonly overallDifficulty: number;

    /**
     * @param overallDifficulty The overall difficulty of this hit window.
     */
    constructor(overallDifficulty: number) {
        this.overallDifficulty = overallDifficulty;
    }

    /**
     * Gets the threshold for 300 (great) hit result.
     *
     * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
     */
    abstract hitWindowFor300(isPrecise?: boolean): number;

    /**
     * Gets the threshold for 100 (good) hit result.
     *
     * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
     */
    abstract hitWindowFor100(isPrecise?: boolean): number;

    /**
     * Gets the threshold for 50 (meh) hit result.
     *
     * @param isPrecise Whether or not to calculate for Precise mod. This is only available for `DroidHitWindow`.
     */
    abstract hitWindowFor50(isPrecise?: boolean): number;
}

/**
 * Represents the hit window of osu!droid.
 */
export class DroidHitWindow extends HitWindow {
    override hitWindowFor300(isPrecise?: boolean): number {
        if (isPrecise) {
            return 55 + 6 * (5 - this.overallDifficulty);
        } else {
            return 75 + 5 * (5 - this.overallDifficulty);
        }
    }

    override hitWindowFor100(isPrecise?: boolean): number {
        if (isPrecise) {
            return 120 + 8 * (5 - this.overallDifficulty);
        } else {
            return 150 + 10 * (5 - this.overallDifficulty);
        }
    }

    override hitWindowFor50(isPrecise?: boolean): number {
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
export class OsuHitWindow extends HitWindow {
    override hitWindowFor300(): number {
        return 80 - 6 * this.overallDifficulty;
    }

    override hitWindowFor100(): number {
        return 140 - 8 * this.overallDifficulty;
    }

    override hitWindowFor50(): number {
        return 200 - 10 * this.overallDifficulty;
    }
}
