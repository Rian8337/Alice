/**
 * Represents an optional type with a fallback to a certain type.
 */
export type Optional<
    TPresent extends boolean,
    TData,
    TFallback = undefined
> = TPresent extends true ? TData : TData | TFallback;
