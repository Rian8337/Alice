class CursorData {
    /**
     * @param {Object} values An object containing the parameters.
     * @param {number} values.size The movement size of the cursor.
     * @param {number[]} values.time The time during which the cursor is active in milliseconds.
     * @param {number[]} values.x The x coordinate of the cursor in osupixels.
     * @param {number[]} values.y The y coordinate of the cursor in osupixels.
     */
    constructor(values = {}) {
        /**
         * @type {number}
         * @description The movement size of the cursor.
         */
        this.size = values.size;

        /**
         * @type {number[]}
         * @description The time during which the cursor is active in milliseconds.
         */
        this.time = [];

        /**
         * @type {number[]}
         * @description The x coordinate of the cursor in osupixels.
         */
        this.x = values.x;

        /**
         * @type {number[]}
         * @description The y coordinate of the cursor in osupixels.
         */
        this.y = values.y;
    }
}

module.exports = CursorData;