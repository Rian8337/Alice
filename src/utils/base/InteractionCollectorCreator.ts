import {
    ButtonInteraction,
    CacheType,
    CollectorFilter,
    ComponentType,
    InteractionCollector,
    Message,
    PartialMessage,
    SelectMenuInteraction,
} from "discord.js";
import { Manager } from "./Manager";

export abstract class InteractionCollectorCreator extends Manager {
    /**
     * Creates a collector for buttons.
     *
     * @param message The message to create the collector on.
     * @param duration The duration this collector will remain active, in seconds.
     * @param filter The filter to use.
     * @param componentAvailabilityListener A function that will be used to check if the
     * component the collector is responsible for still exists if the message is edited.
     *
     * If this function returns `false`, the collector will be stopped.
     * @returns An object containing the collector and a boolean state indicating whether the component was deleted.
     */
    static createButtonCollector(
        message: Message,
        duration: number,
        filter?: CollectorFilter<[ButtonInteraction<CacheType>]>,
        componentAvailabilityListener?: (message: Message) => boolean
    ): {
        readonly collector: InteractionCollector<ButtonInteraction>;
        readonly componentIsDeleted: boolean;
    } {
        const collector: InteractionCollector<ButtonInteraction> =
            message.createMessageComponentCollector({
                filter: (i) => i.isButton() && (filter?.(i) ?? true),
                componentType: ComponentType.Button,
                dispose: true,
                time: duration * 1000,
            });

        const options = {
            collector: collector,
            componentIsDeleted: false,
        };

        if (componentAvailabilityListener) {
            this.attachComponentAvailabilityListener(
                options,
                componentAvailabilityListener
            );
        }

        return options;
    }

    /**
     * Creates a collector for select menu.
     *
     * @param message The message to create the collector on.
     * @param duration The duration this collector will remain active, in seconds.
     * @param filter The filter to use.
     * @param componentAvailabilityListener The listener that will be used to check if the
     * component the collector is responsible for still exists if the message is edited.
     *
     * If this function returns `false`, the collector will be stopped.
     * @returns An object containing the collector and a boolean state indicating whether the component was deleted.
     */
    static createSelectMenuCollector(
        message: Message,
        duration: number,
        filter?: CollectorFilter<[SelectMenuInteraction<CacheType>]>,
        componentAvailabilityListener?: (message: Message) => boolean
    ): {
        readonly collector: InteractionCollector<SelectMenuInteraction>;
        readonly componentIsDeleted: boolean;
    } {
        const collector: InteractionCollector<SelectMenuInteraction> =
            message.createMessageComponentCollector({
                filter: (i) => i.isSelectMenu() && (filter?.(i) ?? true),
                componentType: ComponentType.SelectMenu,
                dispose: true,
                time: duration * 1000,
            });

        const options = {
            collector: collector,
            componentIsDeleted: false,
        };

        if (componentAvailabilityListener) {
            this.attachComponentAvailabilityListener(
                options,
                componentAvailabilityListener
            );
        }

        return options;
    }

    /**
     * Attaches a component availability listener to a collector.
     *
     * @param options Collector options.
     * @param listener The listener.
     */
    private static attachComponentAvailabilityListener(
        options: {
            readonly collector:
                | InteractionCollector<ButtonInteraction>
                | InteractionCollector<SelectMenuInteraction>;
            componentIsDeleted: boolean;
        },
        listener: (message: Message) => boolean
    ): void {
        const { collector } = options;

        const messageEditListener = (
            oldMessage: Message | PartialMessage,
            newMessage: Message | PartialMessage
        ): void => {
            if (
                !collector.ended &&
                collector.messageId === newMessage.id &&
                oldMessage.components.length !== newMessage.components.length &&
                !listener(<Message>newMessage)
            ) {
                options.componentIsDeleted = true;

                collector.stop("Message edited");
            }
        };

        this.client.on("messageUpdate", messageEditListener);

        collector.once("end", () => {
            this.client.removeListener("messageUpdate", messageEditListener);
        });
    }
}
