import { InteractionCollector, Message, MessageComponentInteraction, Snowflake } from "discord.js";

export abstract class InteractionCollectorCreator {
    /**
     * Creates a collector for buttons.
     * 
     * @param message The message to create the collector on.
     * @param users The users who can interact with the buttons.
     * @param duration The duration this collector will remain active.
     * @returns The collector.
     */
    protected static createButtonCollector(message: Message, users: Snowflake[], duration: number): InteractionCollector<MessageComponentInteraction> {
        return message.createMessageComponentCollector({
            filter: (i) => i.isButton() && users.includes(i.user.id),
            componentType: "BUTTON",
            dispose: true,
            idle: Math.min(60000, duration * 1000),
            time: duration * 1000
        });
    }

    /**
     * Creates a collector for select menu.
     * 
     * @param message The message to create the collector on.
     * @param users The users who can interact with the select menu.
     * @param duration The duration this collector will remain active.
     * @returns The collector.
     */
    protected static createSelectMenuCollector(message: Message, users: Snowflake[], duration: number): InteractionCollector<MessageComponentInteraction> {
        return message.createMessageComponentCollector({
            filter: (i) => i.isSelectMenu() && users.includes(i.user.id),
            componentType: "SELECT_MENU",
            dispose: true,
            idle: Math.min(60000, duration * 1000),
            time: duration * 1000
        });
    }
}