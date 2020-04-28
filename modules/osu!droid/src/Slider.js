class Slider {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number[]} values.pos The position of the slider in `[x, y]` osupixels.
     * @param {number} values.distance The distance of the slider.
     * @param {number} values.repetitions The repetition amount of the slider.
     */
    constructor(values) {
        /** 
         * @type {[number, number]}
         * @description The starting position of the slider in `[x, y]` osupixels.
         */
        this.pos = values.pos || [0, 0];

        /**
         * @type {number}
         * @description The travel distance of the slider in osupixels.
         */
        this.distance = values.distance || 0;

        /**
         * @type {number}
         * @description The repetition amount of the slider. Note that 1 repetition means no repeats (1 loop).
         */
        this.repetitions = values.repetitions || 1
    }

    /**
     * Returns the string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return `Position: [${this.pos[0]}, ${this.pos[1]}], distance: ${this.distance.toFixed(2)}, repetitions: ${this.distance}`
    }
}

module.exports = Slider;