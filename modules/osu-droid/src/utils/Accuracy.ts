import { MathUtils } from "../mathutil/MathUtils";

interface AccuracyInformation {
    /**
     * The amount of objects in the beatmap.
     */
    nobjects?: number;

    /**
     * The accuracy achieved.
     */
    percent?: number;

    /**
     * The amount of 300s achieved.
     */
    n300?: number;

    /**
     * The amount of 100s achieved.
     */
    n100?: number;

    /**
     * The amount of 50s achieved.
     */
    n50?: number;

    /**
     * The amount of misses achieved.
     */
    nmiss?: number;
}

/**
 * An accuracy calculator that calculates accuracy based on given parameters.
 */
export class Accuracy implements AccuracyInformation {
    n300: number;
    n100: number;
    n50: number;
    nmiss: number;

    /**
     * Calculates accuracy based on given parameters.
     *
     * If `percent` and `nobjects` are specified, `n300`, `n100`, and `n50` will
     * be automatically calculated to be the closest to the given
     * acc percent.
     *
     * @param values Function parameters.
     */
    constructor(values: AccuracyInformation) {
        this.nmiss = values.nmiss ?? 0;
        this.n300 = values.n300 ?? -1;
        this.n100 = values.n100 ?? 0;
        this.n50 = values.n50 ?? 0;

        let nobjects: number;

        if (values.nobjects) {
            let n300 = this.n300;
            nobjects = values.nobjects;
            let hitcount: number;

            if (n300 < 0) {
                n300 = Math.max(
                    0,
                    nobjects - this.n100 - this.n50 - this.nmiss
                );
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                n300 -= Math.min(n300, hitcount - nobjects);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                this.n100 -= Math.min(this.n100, hitcount - nobjects);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                this.n50 -= Math.min(this.n50, hitcount - nobjects);
            }

            hitcount = n300 + this.n100 + this.n50 + this.nmiss;

            if (hitcount > nobjects) {
                this.nmiss -= Math.min(this.nmiss, hitcount - nobjects);
            }

            this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        }

        if (values.percent) {
            if (!values.nobjects) {
                throw new TypeError(
                    "nobjects is required when specifying percent"
                );
            }
            nobjects = values.nobjects;

            const max300 = nobjects - this.nmiss;

            const maxacc =
                new Accuracy({
                    n300: max300,
                    n100: 0,
                    n50: 0,
                    nmiss: this.nmiss,
                }).value() * 100;

            let acc_percent = values.percent;
            acc_percent = Math.max(0, Math.min(maxacc, acc_percent));

            // just some black magic maths from wolfram alpha

            this.n100 = Math.round(
                -3 * ((acc_percent * 0.01 - 1) * nobjects + this.nmiss) * 0.5
            );

            if (this.n100 > max300) {
                // acc lower than all 100s, use 50s
                this.n100 = 0;
                this.n50 = Math.round(
                    -6 *
                        ((acc_percent * 0.01 - 1) * nobjects + this.nmiss) *
                        0.5
                );
                this.n50 = Math.min(max300, this.n50);
            }

            this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        }
    }

    /**
     * Calculates the accuracy value (0.0 - 1.0).
     *
     * @param nobjects The amount of objects in the beatmap. If `n300` was not specified in the constructor, this is required.
     */
    value(nobjects?: number): number {
        let n300 = this.n300;
        if (n300 < 0) {
            if (!nobjects) {
                throw new TypeError(
                    "Either n300 or nobjects must be specified"
                );
            }
            n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        } else {
            nobjects ??= n300 + this.n100 + this.n50 + this.nmiss;
        }
        const res = (n300 * 6 + this.n100 * 2 + this.n50) / (nobjects * 6);
        return MathUtils.clamp(res, 0, 1);
    }
}
