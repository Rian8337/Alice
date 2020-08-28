/**
 * Represents a hitobject in an osu!droid replay.
 * 
 * Stores information about hitobjects in an osu!droid replay such as hit offset, tickset, and hit result.
 * 
 * This is used when analyzing replays using replay analyzer.
 */
class ReplayObjectData {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} values.accuracy The offset of which the hitobject was hit in milliseconds.
     * @param {boolean[]} values.tickset The ticksets of the hitobject.
     * @param {number} values.result The bitwise result of the hitobject (`4` is 300, `3` is 100, `2` is 50, `1` is miss).
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The offset of which the hitobject was hit in milliseconds.
         */
        this.accuracy = values.accuracy;

        /** 
         * @type {boolean[]}
         * @description The tickset of the hitobject.
         */
        this.tickset = values.tickset;

        /**
         * @type {number}
         * @description The bitwise result of the hitobject (`4` is 300, `3` is 100, `2` is 50, `1` is miss).
         */
        this.result = values.result;
    }
}

module.exports = ReplayObjectData;