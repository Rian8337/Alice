class ReplayObjectData {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} values.accuracy The offset of which the hitobject was hit in milliseconds.
     * @param {number[]} values.tickset The tickset of the hitobject.
     * @param {number} values.result The bitwise result of the hitobject (`4` is 300, `3` is 100, `2` is 50, `1` is miss).
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The offset of which the hitobject was hit in milliseconds.
         */
        this.accuracy = values.accuracy;

        /** 
         * @type {number[]}
         * @description The tickset of the hitobject.
         */
        this.tickset = values.tickset;

        /**
         * @type {number}
         * @description The bitwise result of the hitobject (`4` is 300, `3` is 100, `2` is 50, `1` is miss).
         */
        this.result = values.result
    }
}

module.exports = ReplayObjectData;