/**
 * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
 */
const object_types = {
    /**
     * @type {number}
     * @description The bitwise constant of circle.
     */
    circle: 1<<0,

    /**
     * @type {number}
     * @description The bitwise constant of slider.
     */
    slider: 1<<1,

    /**
     * @type {number}
     * @description The bitwise constant of spinner.
     */
    spinner: 1<<3
};

module.exports = object_types;