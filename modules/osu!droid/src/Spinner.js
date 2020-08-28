class Spinner {
    /**
     * @param {number} duration The duration of the spinner.
     */
    constructor(duration) {
        /**
         * @type {[number, number]} The position of the spinner. This always defaults to `x=256` and `y=192`.
         */
        this.pos = [256, 192];

        /**
         * @type {number}
         * @description The duration of the spinner.
         */
        this.duration = duration;
    }

    toString() {
        return `Position: (${this.pos[0]}, ${this.pos[1]}), duration: ${this.duration}`;
    }
}

module.exports = Spinner;