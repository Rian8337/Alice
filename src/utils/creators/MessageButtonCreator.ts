import { Symbols } from "@alice-enums/utils/Symbols";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { Language } from "@alice-localization/base/Language";
import { MessageButtonCreatorLocalization } from "@alice-localization/utils/creators/MessageButtonCreator/MessageButtonCreatorLocalization";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import {
    ButtonInteraction,
    InteractionReplyOptions,
    Message,
    Snowflake,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ActionRow,
    MessageActionRowComponent,
    APIButtonComponentWithCustomId,
    ButtonComponent,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    JSONEncodable,
    APIEmbed,
} from "discord.js";
import { MessageCreator } from "./MessageCreator";
import { RepliableInteraction } from "@alice-structures/core/RepliableInteraction";

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
     * @param startPage The page to start the paging from.
     * @param maxPage The maximum page of the button-based paging.
     * @param duration The duration the button-based paging will be active, in seconds.
     * @param onPageChange The function to be executed when the page is changed.
     * @param onPageChangeArgs Arguments for `onPageChange` function.
     * @returns The collector that collects the button-pressing event.
     */
    static createLimitedButtonBasedPaging(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        startPage: number,
        maxPage: number,
        duration: number,
        onPageChange: OnButtonPageChange,
        ...onPageChangeArgs: unknown[]
    ): Promise<Message> {
        return this.createButtonBasedPaging(
            interaction,
            options,
            users,
            startPage,
            duration,
            onPageChange,
            maxPage,
            ...onPageChangeArgs
        );
    }

    /**
     * Creates a button-based paging with limitless page.
     *
     * @param interaction The interaction that triggered the button-based paging.
     * @param options Options to be used when sending the button-based paging message.
     * @param users The IDs of users who can interact with the buttons.
     * @param startPage The page to start the paging from.
     * @param duration The duration the button-based paging will be active, in seconds.
     * @param onPageChange The function to be executed when the page is changed.
     * @param onPageChangeArgs Arguments for `onPageChange` function.
     * @returns The collector that collects the button-pressing event.
     */
    static createLimitlessButtonBasedPaging(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        startPage: number,
        duration: number,
        onPageChange: OnButtonPageChange,
        ...onPageChangeArgs: unknown[]
    ): Promise<Message> {
        return this.createButtonBasedPaging(
            interaction,
            options,
            users,
            startPage,
            duration,
            onPageChange,
            Number.POSITIVE_INFINITY,
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
     * @param language The locale of the user who attempted to create the confirmation interaction. Defaults to English.
     * @returns A boolean determining whether the user confirmed.
     */
    static async createConfirmation(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        duration: number,
        language: Language = "en"
    ): Promise<boolean> {
        const localization: MessageButtonCreatorLocalization =
            this.getLocalization(language);

        const buttons: ButtonBuilder[] = this.createConfirmationButtons();

        const component: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

        options.components ??= [];
        options.components.push(component);

        const message: Message = interaction.isMessageComponent()
            ? await InteractionHelper.update(interaction, options)
            : await InteractionHelper.reply(interaction, options);

        const collectorOptions = this.createButtonCollector(
            message,
            duration,
            (i) =>
                buttons.some(
                    (b) =>
                        (<APIButtonComponentWithCustomId>b.data).custom_id ===
                        i.customId
                ) && users.includes(i.user.id),
            (m) => {
                const row: ActionRow<MessageActionRowComponent> | undefined =
                    m.components.find(
                        (c) => c.components.length === buttons.length
                    );

                if (!row) {
                    return false;
                }

                return row.components.every(
                    (c, i) =>
                        c instanceof ButtonComponent &&
                        c.customId ===
                            (<APIButtonComponentWithCustomId>buttons[i].data)
                                .custom_id
                );
            }
        );

        const { collector } = collectorOptions;

        collector.once("collect", async (i) => {
            await i.deferUpdate();

            collector.stop();
        });

        return new Promise((resolve) => {
            collector.once("end", async (collected) => {
                const pressed: ButtonInteraction | undefined =
                    collected.first();

                if (pressed) {
                    if (pressed.customId === "yes") {
                        interaction.isMessageComponent()
                            ? await InteractionHelper.update(interaction, {
                                  content: MessageCreator.createPrefixedMessage(
                                      localization.getTranslation("pleaseWait"),
                                      Symbols.timer
                                  ),
                              })
                            : await InteractionHelper.reply(interaction, {
                                  content: MessageCreator.createPrefixedMessage(
                                      localization.getTranslation("pleaseWait"),
                                      Symbols.timer
                                  ),
                              });
                    } else {
                        interaction.isMessageComponent()
                            ? await InteractionHelper.update(interaction, {
                                  content: MessageCreator.createReject(
                                      localization.getTranslation(
                                          "actionCancelled"
                                      )
                                  ),
                              })
                            : await InteractionHelper.reply(interaction, {
                                  content: MessageCreator.createReject(
                                      localization.getTranslation(
                                          "actionCancelled"
                                      )
                                  ),
                              });

                        if (!interaction.ephemeral) {
                            setTimeout(() => {
                                interaction.deleteReply();
                            }, 5 * 1000);
                        }
                    }

                    const index: number = (<
                        APIActionRowComponent<APIMessageActionRowComponent>[]
                    >options.components).findIndex((v) => {
                        return (
                            v.components.length === buttons.length &&
                            v.components.every(
                                (c, i) =>
                                    c instanceof ButtonComponent &&
                                    c.customId ===
                                        (<APIButtonComponentWithCustomId>(
                                            buttons[i].data
                                        )).custom_id
                            )
                        );
                    });

                    if (index !== -1) {
                        options.components!.splice(index, 1);
                    }
                } else {
                    await InteractionHelper.reply(interaction, {
                        content: MessageCreator.createReject(
                            localization.getTranslation("timedOut")
                        ),
                        components: [],
                    });

                    if (!interaction.ephemeral) {
                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5 * 1000);
                    }
                }

                resolve(collected.first()?.customId === "yes");
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
     * @param startPage The page to start the paging from.
     * @param duration The duration the button-based paging will be active, in seconds.
     * @param onPageChange The function to be executed when the page is changed.
     * @param maxPage The maximum page.
     * @param onPageChangeArgs Arguments for `onPageChange` function.
     * @returns The collector that collects the button-pressing event.
     */
    private static async createButtonBasedPaging(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        startPage: number,
        duration: number,
        onPageChange: OnButtonPageChange,
        maxPage: number,
        ...onPageChangeArgs: unknown[]
    ): Promise<Message> {
        let currentPage: number = Math.min(startPage, maxPage);

        const buttons: ButtonBuilder[] = this.createPagingButtons(
            currentPage,
            maxPage
        );

        const component: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

        if (maxPage !== 1) {
            options.components ??= [];
            options.components.push(component);
        }

        /**
         * Edits paging embed if the page button uses an embed to display contents to the user.
         */
        function onPageChangeEmbedEdit(): void {
            if (options.embeds) {
                for (let i = 0; i < options.embeds.length; ++i) {
                    const embed = options.embeds[i];

                    let data: APIEmbed;

                    // Check if the interface is implemented.
                    if ((<JSONEncodable<APIEmbed>>embed).toJSON) {
                        data = (<JSONEncodable<APIEmbed>>embed).toJSON();
                    } else {
                        data = <APIEmbed>embed;
                    }

                    if (data.fields) {
                        data.fields.length = 0;
                    }
                }
            }
        }

        await onPageChange(options, startPage, ...onPageChangeArgs);

        const message: Message = interaction.isMessageComponent()
            ? await InteractionHelper.update(interaction, options)
            : await InteractionHelper.reply(interaction, options);

        if (maxPage === 1) {
            return message;
        }

        const collectorOptions = this.createButtonCollector(
            message,
            duration,
            (i) =>
                buttons.some(
                    (b) =>
                        (<APIButtonComponentWithCustomId>b.data).custom_id ===
                        i.customId
                ) && users.includes(i.user.id),
            (m) => {
                const row: ActionRow<MessageActionRowComponent> | undefined =
                    m.components.find(
                        (c) => c.components.length === buttons.length
                    );

                if (!row) {
                    return false;
                }

                return row.components.every(
                    (c, i) =>
                        c.customId ===
                        (<APIButtonComponentWithCustomId>buttons[i].data)
                            .custom_id
                );
            }
        );

        collectorOptions.collector.on("collect", async (i) => {
            await i.deferUpdate();

            switch (i.customId) {
                case "backward":
                    currentPage = Math.max(1, currentPage - 10);
                    break;
                case "back":
                    if (currentPage === 1) {
                        currentPage = maxPage;
                    } else {
                        --currentPage;
                    }
                    break;
                case "next":
                    if (currentPage === maxPage) {
                        currentPage = 1;
                    } else {
                        ++currentPage;
                    }
                    break;
                case "forward":
                    currentPage = Math.min(currentPage + 10, maxPage);
                    break;
                default:
                    return;
            }

            component.setComponents(
                this.createPagingButtons(currentPage, maxPage)
            );

            onPageChangeEmbedEdit();

            await onPageChange(options, currentPage, ...onPageChangeArgs);

            await i.editReply(options);
        });

        collectorOptions.collector.once("end", async () => {
            const index: number = (<
                APIActionRowComponent<APIMessageActionRowComponent>[]
            >options.components).findIndex((v) => {
                return (
                    v.components.length === buttons.length &&
                    v.components.every(
                        (c, i) =>
                            c instanceof ButtonComponent &&
                            c.customId ===
                                (<APIButtonComponentWithCustomId>(
                                    buttons[i].data
                                )).custom_id
                    )
                );
            });

            if (index !== -1) {
                options.components!.splice(index, 1);
            }

            if (!collectorOptions.componentIsDeleted) {
                try {
                    interaction.isMessageComponent()
                        ? await InteractionHelper.update(interaction, options)
                        : await InteractionHelper.reply(interaction, options);
                    // eslint-disable-next-line no-empty
                } catch {}
            }
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
    ): ButtonBuilder[] {
        return [
            new ButtonBuilder()
                .setCustomId("backward")
                .setEmoji(Symbols.skipBackward)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 1 || maxPage <= 5),
            new ButtonBuilder()
                .setCustomId("back")
                .setEmoji(Symbols.leftArrow)
                .setStyle(ButtonStyle.Success)
                .setDisabled(
                    maxPage === 1 ||
                        (maxPage === Number.POSITIVE_INFINITY &&
                            currentPage === 1)
                ),
            new ButtonBuilder()
                .setCustomId("none")
                .setLabel(
                    Number.isFinite(maxPage)
                        ? `${currentPage}/${maxPage}`
                        : currentPage.toString()
                )
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("next")
                .setEmoji(Symbols.rightArrow)
                .setStyle(ButtonStyle.Success)
                .setDisabled(maxPage === 1),
            new ButtonBuilder()
                .setCustomId("forward")
                .setEmoji(Symbols.skipForward)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === maxPage || maxPage <= 5),
        ];
    }

    /**
     * Creates buttons used in confirmation.
     *
     * ID order: `[yes, no]`
     */
    private static createConfirmationButtons(): ButtonBuilder[] {
        return [
            new ButtonBuilder()
                .setCustomId("yes")
                .setEmoji(Symbols.checkmark)
                .setLabel("Yes")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("no")
                .setEmoji(Symbols.cross)
                .setLabel("No")
                .setStyle(ButtonStyle.Danger),
        ];
    }

    /**
     * Gets the localization of this creator utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language
    ): MessageButtonCreatorLocalization {
        return new MessageButtonCreatorLocalization(language);
    }
}
