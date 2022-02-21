import { Language } from "./Language";

export type Translation<T extends Record<keyof T, string>> = Record<
    Language,
    T
>;
