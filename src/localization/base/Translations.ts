import { Language } from "./Language";
import { Translation } from "./Translation";

export type Translations<T extends Record<keyof T, string>> = Record<
    Language,
    Translation<T>
>;
