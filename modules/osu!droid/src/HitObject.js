const Circle = require('./Circle');
const Slider = require('./Slider');
const Spinner = require('./Spinner');
const objectTypes = require('./constants/objectTypes');

/**
 * Represents a hitobject in a beatmap.
 *
 * The only common property is start time (in milliseconds).
 * Object-specific properties are stored in `data`, which can be
 * an instance of `Circle`, `Slider`, or `null`.
 */
class HitObject {
    /**
     * Represents a hitobject in a beatmap.
     *
     * The only common property is start time (in milliseconds).
     * Object-specific properties are stored in `data`, which can be
     * an instance of `Circle`, `Slider`, or `null`.
     * 
     * @param {Object} values An object containing the parameters.
     * @param {number} values.time The start time of the object in milliseconds.
     * @param {number} values.type The bitwise type of the hitobject (circle/slider/spinner).
     * @param {Circle|Slider|Spinner} [values.data] The data of the hitobject (Circle/Slider/Spinner).
     */
    constructor(values) {
        /**
         * @type {number}
         * @description The start time of the object in milliseconds.
         */
        this.time = values.time || 0;

        /**
         * @type {number}
         * @description The bitwise type of the hitobject (circle/slider/spinner).
         */
        this.type = values.type || 0;

        if (values.data) {
            /**
             * @type {Circle|Slider|Spinner}
             * @description The data of the hitobject, which can be an instance of `Circle`, `Slider` or `Spinner`.
             */
            this.data = values.data;
        }

        /**
         * @type {boolean}
         * @description Whether or not this hitobject represents a new combo in the beatmap.
         */
        this.isNewCombo = !!(this.type & 1<<2);
    }

    /**
     * Returns the hitobject type.
     *
     * @returns {string} The hitobject type.
     */
    typeStr() {
        let res = '';
        if (this.type & objectTypes.circle) res += "circle | ";
        if (this.type & objectTypes.slider) res += "slider | ";
        if (this.type & objectTypes.spinner) res += "spinner | ";
        return res.substring(0, Math.max(0, res.length - 3))
    }

    /**
     * Returns the string representative of the class.
     *
     * @returns {string} The string representation of the class.
     */
    toString() {
        return (
            "{ time: " + this.time.toFixed(2) + ", " +
            "type: " + this.typeStr() +
            (this.data ? ", " + this.data.toString() : "") +
            " }"
        )
    }
}

module.exports = HitObject;