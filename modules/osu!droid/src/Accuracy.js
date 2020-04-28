class Accuracy {
    /**
     * Calculates accuracy based on given parameters.
     * 
     * If `percent` and `nobjects` are specified, `n300`, `n100`, and `n50` will
     * be automatically calculated to be the closest to the given
     * acc percent.
     * 
     * @param {Object} values An object containing parameters.
     * @param {number} [values.nobjects] The amount of objects in the beatmap.
     * @param {number} [values.percent] The accuracy achieved.
     * @param {number} [values.n300] The amount of 300s achieved.
     * @param {number} [values.n100] The amount of 100s achieved.
     * @param {number} [values.n50] The amount of 50s achieved.
     * @param {number} [values.nmiss] The amount of miss count achieved.
     */
    constructor(values) {
        /**
         * @type {number}
         * @description The amount of misses achieved.
         */
        this.nmiss = values.nmiss || 0;

        /**
         * @type {number}
         * @description The amount of 300s achieved.
         */
        this.n300 = values.n300 !== undefined ? values.n300 : -1;

        /**
         * @type {number}
         * @description The amount of 100s achieved.
         */
        this.n100 = values.n100 || 0;

        /**
         * @type {number}
         * @description The amount of 50s achieved.
         */
        this.n50 = values.n50 || 0;

        let nobjects;

        if (values.nobjects) {
            let n300 = this.n300;
            nobjects = values.nobjects;
            let hitcount;

            if (n300 < 0) {
                n300 = Math.max(0, nobjects - this.n100 - this.n50 - this.nmiss);
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
            nobjects = values.nobjects;
            if (!nobjects) {
                throw new TypeError("nobjects is required when specifying percent");
            }

            let max300 = nobjects - this.nmiss;

            let maxacc = new Accuracy({
                n300: max300, n100: 0, n50: 0, nmiss: this.nmiss
            }).value() * 100.0;

            let acc_percent = values.percent;
            acc_percent = Math.max(0.0, Math.min(maxacc, acc_percent));

            // just some black magic maths from wolfram alpha

            this.n100 = Math.round(
                -3.0 * ((acc_percent * 0.01 - 1.0) * nobjects + this.nmiss) * 0.5
            );

            if (this.n100 > max300) {
                // acc lower than all 100s, use 50s
                this.n100 = 0;
                this.n50 = Math.round(
                    -6.0 * ((acc_percent * 0.01 - 1.0) * nobjects + this.nmiss) * 0.5
                );
                this.n50 = Math.min(max300, this.n50);
            }

            this.n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        }
    }

    /**
     * Computes the accuracy value (0.0 - 1.0).
     * 
     * If `n300` was specified in the constructor, `nobjects` is not reqired and will be automatically computed.
     *
     * @param {number} [nobjects] The amount of objects in the beatmap.
     * @returns {number} The accuracy value ranging from 0.0 to 1.0.
     */
    value(nobjects) {
        let n300 = this.n300;
        if (n300 < 0) {
            if (!nobjects) {
                throw new TypeError("either n300 or nobjects must be specified");
            }
            n300 = nobjects - this.n100 - this.n50 - this.nmiss;
        } else {
            nobjects = n300 + this.n100 + this.n50 + this.nmiss;
        }
        let res = (
            (n300 * 300.0 + this.n100 * 100.0 + this.n50 * 50.0) /
            (nobjects * 300.0)
        );
        return Math.max(0, Math.min(res, 1.0));
    }

    /**
     * Returns the string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return (
            (this.value() * 100.0).toFixed(2) + "% "
            + this.n100 + "x100 " + this.n50 + "x50 "
            + this.nmiss + "xmiss"
        )
    }
}

module.exports = Accuracy;
