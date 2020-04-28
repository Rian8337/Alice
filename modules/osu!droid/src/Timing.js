class Timing {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} values.time The time of which the timing point is applied in milliseconds.
     * @param {number} [values.ms_per_beat=600] The amount of milliseconds passed for each beat.
     * @param {boolean} [values.change=true] Whether or not the timing point does not inherit from the previous timing point.
     */
    constructor(values) {
        /**
         * @type {number}
         * @description The time of which the timing is applied in milliseconds.
         */
        this.time = values.time || 0.0;

        /**
         * @type {number}
         * @description The amount of milliseconds passed for each beat.
         */
        this.ms_per_beat = values.ms_per_beat;
        if (!this.ms_per_beat) {
            this.ms_per_beat = 600.0;
        }

        /**
         * @type {boolean}
         * @description Whether or not the timing point does not inherit from the previous timing point.
         */
        this.change = values.change;
        if (!this.change) {
            this.change = true;
        }
    }

    /**
     * Returns a string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return "{ time: " + this.time.toFixed(2) + ", "
            + "ms_per_beat: " + this.ms_per_beat.toFixed(2) + " }";
    }
}

module.exports = Timing;