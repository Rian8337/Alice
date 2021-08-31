import { Bot } from "@alice-core/Bot";

export type DatabaseUtilityConstructor<T, C> = new (client: Bot, data?: T) => C;