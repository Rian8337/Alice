import { CollectorState } from "@alice-structures/utils/CollectorState";
import {
    ButtonInteraction,
    CacheType,
    CollectedInteraction,
    CollectorFilter,
    ComponentType,
    InteractionCollector,
    MappedInteractionTypes,
    Message,
    MessageComponentType,
    PartialMessage,
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
    ): CollectorState<ButtonInteraction> {
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
    static createSelectMenuCollector<
        T extends Exclude<MessageComponentType, ComponentType.Button>
    >(
        message: Message,
        duration: number,
        filter?: CollectorFilter<[MappedInteractionTypes[T]]>,
        componentAvailabilityListener?: (message: Message) => boolean
    ): CollectorState<MappedInteractionTypes[T]> {
        const collector: InteractionCollector<MappedInteractionTypes[T]> =
            message.createMessageComponentCollector({
                filter: (i) => filter?.(i) ?? true,
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
    private static attachComponentAvailabilityListener<
        T extends CollectedInteraction
    >(
        options: CollectorState<T>,
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

        const messageDeleteListener = (
            message: Message | PartialMessage
        ): void => {
            if (collector.messageId === message.id) {
                options.componentIsDeleted = true;

                collector.stop("Message deleted");
            }
        };

        this.client.on("messageUpdate", messageEditListener);
        // Collector will end internally, so we don't need to end it here.
        this.client.once("messageDelete", messageDeleteListener);

        collector.once("end", () => {
            this.client.removeListener("messageUpdate", messageEditListener);
            this.client.removeListener("messageDelete", messageDeleteListener);
        });
    }
}
