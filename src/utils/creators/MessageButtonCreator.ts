import { Symbols } from "@alice-enums/utils/Symbols";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import {
    ButtonInteraction,
    CommandInteraction,
    InteractionCollector,
    InteractionReplyOptions,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
    Snowflake,
} from "discord.js";
import { MessageCreator } from "./MessageCreator";

/**
 * A utility to create message buttons.
 */
export abstract class MessageButtonCreator extends InteractionCollectorCreator {
    /**
     * Creates a button-based paging with limited page.
     *
     * If there is only 1 page to view, no buttons will be enabled.
     *
     * @param interaction The interaction that triggered the button-based paging.
     * @param options Options to be used when sending the button-based paging message.
     * @param users The IDs of users who can interact with the buttons.
     * @param contents The contents to be used in the button-based paging.
     * @param contentsPerPage The amount of contents to be displayed in one page.
     * @param startPage The page to start the paging from.
     * @param duration The duration the button-based paging will be active, in seconds.
     * @param onPageChange The function to be executed when the page is changed.
     * @param onPageChangeArgs Arguments for `onPageChange` function.
     * @returns The collector that collects the button-pressing event.
     */
    static createLimitedButtonBasedPaging(
        interaction: CommandInteraction | MessageComponentInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        contents: unknown[],
        contentsPerPage: number,
        startPage: number,
        duration: number,
        onPageChange: OnButtonPageChange,
        ...onPageChangeArgs: unknown[]
    ): Promise<Message> {
        return this.createButtonBasedPaging(
            interaction,
            options,
            users,
            contents,
            contentsPerPage,
            startPage,
            duration,
            false,
            onPageChange,
            ...onPageChangeArgs
        );
    }

    /**
     * Creates a button-based paging with limitless page.
     *
     * @param interaction The interaction that triggered the button-based paging.
     * @param options Options to be used when sending the button-based paging message.
     * @param users The IDs of users who can interact with the buttons.
     * @param contents The contents to be used in the button-based paging.
     * @param startPage The page to start the paging from.
     * @param duration The duration the button-based paging will be active, in seconds.
     * @param onPageChange The function to be executed when the page is changed.
     * @param onPageChangeArgs Arguments for `onPageChange` function.
     * @returns The collector that collects the button-pressing event.
     */
    static createLimitlessButtonBasedPaging(
        interaction: CommandInteraction | MessageComponentInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        contents: unknown[],
        startPage: number,
        duration: number,
        onPageChange: OnButtonPageChange,
        ...onPageChangeArgs: unknown[]
    ): Promise<Message> {
        return this.createButtonBasedPaging(
            interaction,
            options,
            users,
            contents,
            Number.POSITIVE_INFINITY,
            startPage,
            duration,
            true,
            onPageChange,
            ...onPageChangeArgs
        );
    }

    /**
     * Creates a confirmation interaction using buttons.
     *
     * @param interaction The interaction that triggered the confirmation buttons.
     * @param options Options of the confirmation message.
     * @param users The users who can perform confirmation.
     * @param duration The duration the confirmation button collector will remain active, in seconds.
     * @returns A boolean determining whether the user confirmed.
     */
    static async createConfirmation(
        interaction: CommandInteraction | MessageComponentInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        duration: number
    ): Promise<boolean> {
        const buttons: MessageButton[] = this.createConfirmationButtons();

        const component: MessageActionRow =
            new MessageActionRow().addComponents(buttons);

        options.components ??= [];
        options.components.push(component);

        const message: Message = <Message>await interaction.editReply(options);

        const collector: InteractionCollector<ButtonInteraction> =
            this.createButtonCollector(message, users, duration);

        collector.on("collect", () => {
            collector.stop();
        });

        return new Promise((resolve) => {
            collector.on("end", async (collected) => {
                const pressed: ButtonInteraction | undefined =
                    collected.first();

                if (pressed) {
                    if (pressed.customId === "yes") {
                        await interaction.editReply({
                            content: MessageCreator.createPrefixedMessage(
                                "Please wait...",
                                Symbols.timer
                            ),
                            components: [],
                        });
                    } else {
                        await interaction.editReply({
                            content:
                                MessageCreator.createReject(
                                    "Action cancelled."
                                ),
                            components: [],
                        });

                        if (!interaction.ephemeral) {
                            setTimeout(() => {
                                interaction.deleteReply();
                            }, 5 * 1000);
                        }
                    }
                } else {
                    await interaction.editReply({
                        content: MessageCreator.createReject("Timed out."),
                        components: [],
                    });

                    if (!interaction.ephemeral) {
                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5 * 1000);
                    }

                    resolve(collected.first()?.customId === "yes");
                }
            });
        });
    }

    /**
     * Creates a button-based paging.
     *
     * If there is only 1 page to view, no buttons will be shown.
     *
     * @param interaction The interaction that triggered the button-based paging.
     * @param options Options to be used when sending the button-based paging message.
     * @param users The IDs of users who can interact with the buttons.
     * @param contents The contents to be used in the button-based paging.
     * @param contentsPerPage The amount of contents to be displayed in one page.
     * @param startPage The page to start the paging from.
     * @param duration The duration the button-based paging will be active, in seconds.
     * @param limitless Whether the button-based paging has no end page.
     * @param onPageChange The function to be executed when the page is changed.
     * @param onPageChangeArgs Arguments for `onPageChange` function.
     * @returns The collector that collects the button-pressing event.
     */
    private static async createButtonBasedPaging(
        interaction: CommandInteraction | MessageComponentInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        contents: unknown[],
        contentsPerPage: number,
        startPage: number,
        duration: number,
        limitless: boolean,
        onPageChange: OnButtonPageChange,
        ...onPageChangeArgs: unknown[]
    ): Promise<Message> {
        const pages: number = limitless
            ? Number.POSITIVE_INFINITY
            : Math.ceil(contents.length / contentsPerPage);

        let currentPage: number = startPage;

        const buttons: MessageButton[] = this.createPagingButtons(
            currentPage,
            pages
        );

        const component: MessageActionRow =
            new MessageActionRow().addComponents(buttons);

        if (pages !== 1) {
            options.components ??= [];
            options.components.push(component);
        }

        /**
         * Edits paging embed if the page button uses an embed to display contents to the user.
         */
        function onPageChangeEmbedEdit(): void {
            if (options.embeds) {
                for (let i = 0; i < options.embeds.length; ++i) {
                    const embed: MessageEmbed = <MessageEmbed>options.embeds[i];

                    embed.spliceFields(0, embed.fields.length);

                    options.embeds[i] = embed;
                }
            }
        }

        await onPageChange(options, startPage, contents, ...onPageChangeArgs);

        const message: Message = <Message>await interaction.editReply(options);

        if (pages === 1) {
            return message;
        }

        const collector: InteractionCollector<ButtonInteraction> =
            this.createButtonCollector(message, users, duration);

        collector.on("collect", async (i) => {
            await i.deferUpdate();

            switch (i.customId) {
                case "backward":
                    currentPage = Math.max(1, currentPage - 10);
                    break;
                case "back":
                    if (currentPage === 1) {
                        currentPage = pages;
                    } else {
                        --currentPage;
                    }
                    break;
                case "next":
                    if (currentPage === pages) {
                        currentPage = 1;
                    } else {
                        ++currentPage;
                    }
                    break;
                case "forward":
                    currentPage = Math.min(currentPage + 10, pages);
                    break;
                default:
                    return;
            }

            component
                .spliceComponents(0, component.components.length)
                .addComponents(this.createPagingButtons(currentPage, pages));

            onPageChangeEmbedEdit();

            await onPageChange(
                options,
                currentPage,
                contents,
                ...onPageChangeArgs
            );

            await i.editReply(options);
        });

        collector.on("end", async () => {
            // Disable all buttons

            component.components.forEach((component) => {
                component.setDisabled(true);
            });

            try {
                await interaction.editReply(options);
                // eslint-disable-next-line no-empty
            } catch {}
        });

        return message;
    }

    /**
     * Creates buttons used in paging.
     *
     * ID order: `[backward, back, none, next, forward]`
     *
     * @param currentPage The current page to be used for button label.
     * @param maxPage The maximum page possible to be used for button label.
     */
    private static createPagingButtons(
        currentPage: number,
        maxPage: number
    ): MessageButton[] {
        return [
            new MessageButton()
                .setCustomId("backward")
                .setEmoji(Symbols.skipBackward)
                .setStyle("PRIMARY")
                .setDisabled(currentPage === 1 || maxPage <= 5),
            new MessageButton()
                .setCustomId("back")
                .setEmoji(Symbols.leftArrow)
                .setStyle("SUCCESS")
                .setDisabled(maxPage === 1),
            new MessageButton()
                .setCustomId("none")
                .setLabel(
                    Number.isFinite(maxPage)
                        ? `${currentPage}/${maxPage}`
                        : currentPage.toString()
                )
                .setStyle("SECONDARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("next")
                .setEmoji(Symbols.rightArrow)
                .setStyle("SUCCESS")
                .setDisabled(maxPage === 1),
            new MessageButton()
                .setCustomId("forward")
                .setEmoji(Symbols.skipForward)
                .setStyle("PRIMARY")
                .setDisabled(currentPage === maxPage || maxPage <= 5),
        ];
    }

    /**
     * Creates buttons used in confirmation.
     *
     * ID order: `[yes, no]`
     */
    private static createConfirmationButtons(): MessageButton[] {
        return [
            new MessageButton()
                .setCustomId("yes")
                .setEmoji(Symbols.checkmark)
                .setLabel("Yes")
                .setStyle("SUCCESS"),
            new MessageButton()
                .setCustomId("no")
                .setEmoji(Symbols.cross)
                .setLabel("No")
                .setStyle("DANGER"),
        ];
    }
}
