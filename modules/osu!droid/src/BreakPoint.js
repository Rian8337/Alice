/**
 * Represents a break period in a beatmap.
 */
class BreakPoint {
    /**
     * @param {Object} params An object containing parameters.
     * @param {number} params.startTime The start time of the break period.
     * @param {number} params.endTime The end time of the break period.
     */
    constructor(params) {
        /**
         * @type {number}
         * @description The start time of the break period.
         */
        this.startTime = params.startTime;

        /**
         * @type {number}
         * @description The end time of the break period.
         */
        this.endTime = params.endTime;

        /**
         * @type {number}
         * @description The duration of the break period. This is obtained from `endTime - startTime`.
         */
        this.duration = this.endTime - this.startTime;
    }

    /**
     * Returns a string representation of the class.
     * 
     * @returns {string} The string representation of the class.
     */
    toString() {
        return `Start time: ${this.startTime}, end time: ${this.endTime}, duration: ${this.duration}`
    }
}

module.exports = BreakPoint;