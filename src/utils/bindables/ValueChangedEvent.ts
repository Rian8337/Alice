/**
 * An event fired when a value changes, providing old and new value for reference.
 */
export type ValueChangedEvent<T> = (oldValue: T, newValue: T) => unknown;
