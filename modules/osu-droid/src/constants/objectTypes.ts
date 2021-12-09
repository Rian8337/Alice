/**
 * Bitmask constant of object types. This is needed as osu! uses bits to determine object types.
 */
export enum objectTypes {
    circle = 1 << 0,
    slider = 1 << 1,
    spinner = 1 << 3,
}
