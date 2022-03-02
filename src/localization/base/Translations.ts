import { Language } from "./Language";
import { Translation } from "./Translation";

export type Translations<T extends Record<keyof T, string>> = Partial<
    Record<Language, Translation<T>>
> &
    Record<"en", Translation<T>>;
