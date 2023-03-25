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
    APIButtonComponentWithCustomId,
    ButtonComponent,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    APIEmbed,
    isJSONEncodable,
    AttachmentBuilder,
    RepliableInteraction,
} from "discord.js";
import { MessageCreator } from "./MessageCreator";
import { MissAnalyzer } from "@alice-utils/missanalyzer/MissAnalyzer";
import { ReplayData } from "@rian8337/osu-droid-replay-analyzer";
import { MissInformation } from "@alice-utils/missanalyzer/MissInformation";
import { OnButtonPressed } from "@alice-structures/utils/OnButtonPressed";
import { OnButtonCollectorEnd } from "@alice-structures/utils/OnButtonCollectorEnd";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { Beatmap } from "@rian8337/osu-base";

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
     * @returns The message resulted from the interaction's reply.
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
     * @returns The message resulted from the interaction's reply.
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
    static createConfirmation(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        users: Snowflake[],
        duration: number,
        language: Language = "en"
    ): Promise<boolean> {
        const localization: MessageButtonCreatorLocalization =
            this.getLocalization(language);

        const buttons: ButtonBuilder[] = this.createConfirmationButtons();

        return new Promise((resolve) =>
            this.createLimitedTimeButtons(
                interaction,
                options,
                buttons,
                users,
                duration,
                async (c, i) => {
                    await i.deferUpdate();

                    c.stop();
                },
                async (c) => {
                    const pressed: ButtonInteraction | undefined =
                        c.collector.collected.first();

                    if (pressed) {
                        if (pressed.customId === "yes") {
                            interaction.isMessageComponent()
                                ? await InteractionHelper.update(interaction, {
                                      content:
                                          MessageCreator.createPrefixedMessage(
                                              localization.getTranslation(
                                                  "pleaseWait"
                                              ),
                                              Symbols.timer
                                          ),
                                  })
                                : await InteractionHelper.reply(interaction, {
                                      content:
                                          MessageCreator.createPrefixedMessage(
                                              localization.getTranslation(
                                                  "pleaseWait"
                                              ),
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
                            ActionRowBuilder<ButtonBuilder>[]
                        >options.components).findIndex((v) => {
                            return (
                                v.components.length === buttons.length &&
                                v.components.every(
                                    (c, i) =>
                                        (<APIButtonComponentWithCustomId>c.data)
                                            .custom_id ===
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

                    resolve(pressed?.customId === "yes");
                }
            )
        );
    }

    /**
     * Creates a miss analyzer button.
     *
     * @param interaction The interaction that triggered the button.
     * @param options Options of the message.
     * @param beatmap The beatmap shown in the miss analyzer.
     * @param replayData The replay data.
     * @returns The message resulted from the interaction's reply.
     */
    static createMissAnalyzerButton(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        beatmap: Beatmap,
        replayData: ReplayData
    ): Promise<Message> {
        const button: ButtonBuilder = new ButtonBuilder()
            .setCustomId("analyze-miss")
            .setLabel("Analyze First 10 Misses (Beta)")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(Symbols.magnifyingGlassTiltedRight);

        CacheManager.exemptedButtonCustomIds.add("analyze-miss");

        return this.createLimitedTimeButtons(
            interaction,
            options,
            [button],
            [interaction.user.id],
            60,
            async (c, i) => {
                await i.deferReply();

                c.stop();
            },
            async (c) => {
                // Remove the original button
                const index: number = (<ActionRowBuilder<ButtonBuilder>[]>(
                    options.components
                )).findIndex((v) => {
                    if (v.components.length !== 1) {
                        return;
                    }

                    return (
                        (<APIButtonComponentWithCustomId>v.components[0].data)
                            .custom_id ===
                        (<APIButtonComponentWithCustomId>button.data).custom_id
                    );
                });

                if (index !== -1) {
                    options.components!.splice(index, 1);
                }

                if (!c.componentIsDeleted) {
                    try {
                        interaction.isMessageComponent()
                            ? await InteractionHelper.update(
                                  interaction,
                                  options
                              )
                            : await InteractionHelper.reply(
                                  interaction,
                                  options
                              );
                        // eslint-disable-next-line no-empty
                    } catch {}
                }

                const pressed: ButtonInteraction | undefined =
                    c.collector.collected.first();

                if (pressed) {
                    const missAnalyzer: MissAnalyzer = new MissAnalyzer(
                        beatmap,
                        replayData
                    );
                    const missInformations: MissInformation[] =
                        missAnalyzer.analyze();

                    const buttons: ButtonBuilder[] = [];

                    for (let i = 0; i < missInformations.length; ++i) {
                        const id: string = `analyze-miss-${i + 1}`;

                        CacheManager.exemptedButtonCustomIds.add(id);

                        buttons.push(
                            new ButtonBuilder()
                                .setCustomId(`analyze-miss-${i + 1}`)
                                .setStyle(
                                    i === 0
                                        ? ButtonStyle.Success
                                        : ButtonStyle.Primary
                                )
                                .setLabel((i + 1).toString())
                                // Disable the first button as the first miss will be loaded initially.
                                .setDisabled(i === 0)
                        );
                    }

                    const options: InteractionReplyOptions = {
                        content: MessageCreator.createWarn(
                            "This feature is still beta. Expect wrong verdicts."
                        ),
                        files: [
                            new AttachmentBuilder(
                                missInformations[0].draw().toBuffer(),
                                { name: "miss-1.png" }
                            ),
                        ],
                    };

                    this.createLimitedTimeButtons(
                        pressed,
                        options,
                        buttons,
                        [interaction.user.id],
                        90,
                        async (_, i) => {
                            await i.deferUpdate();

                            const pressedIndex: number = parseInt(
                                i.customId.replace("analyze-miss-", "")
                            );
                            const attachment: AttachmentBuilder =
                                new AttachmentBuilder(
                                    missInformations[pressedIndex - 1]
                                        .draw()
                                        .toBuffer(),
                                    { name: `miss-${pressedIndex}.png` }
                                );

                            for (let i = 0; i < buttons.length; ++i) {
                                buttons[i]
                                    .setDisabled(i === pressedIndex - 1)
                                    .setStyle(
                                        missInformations[i].isGenerated
                                            ? ButtonStyle.Secondary
                                            : i === pressedIndex - 1
                                            ? ButtonStyle.Success
                                            : ButtonStyle.Primary
                                    );
                            }

                            options.files = [attachment];

                            await i.editReply(options);
                        },
                        async (c) => {
                            if (c.componentIsDeleted) {
                                return;
                            }

                            options.components = [];

                            try {
                                await InteractionHelper.update(
                                    pressed,
                                    options
                                );
                                // eslint-disable-next-line no-empty
                            } catch {}
                        }
                    );
                }
            }
        );
    }

    /**
     * Creates a button collector that lasts for the specified duration.
     *
     * After the duration ends, it is recommended to remove or disable necessary components
     * via {@link onButtonCollectorEnd}.
     *
     * @param interaction The interaction that triggered the button collector.
     * @param options Options for the message.
     * @param buttons The buttons to display.
     * @param users The users who can interact with the buttons.
     * @param duration The duration the collector will remain active, in seconds.
     * @param onButtonPressedListener The function that will be run when a button is pressed.
     * @param onButtonCollectorEnd The function that will be run when the collector ends.
     * This function should remove or disable necessary components.
     * @returns The message resulted from the interaction's reply.
     */
    static async createLimitedTimeButtons(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        buttons: ButtonBuilder[],
        users: Snowflake[],
        duration: number,
        onButtonPressedListener: OnButtonPressed,
        onButtonCollectorEnd: OnButtonCollectorEnd
    ): Promise<Message> {
        const components: ActionRowBuilder<ButtonBuilder>[] = [];

        for (let i = 0; i < buttons.length; ++i) {
            if (i % 5 === 0) {
                components.push(new ActionRowBuilder());
            }

            components[components.length - 1].addComponents(buttons[i]);
        }

        options.components ??= [];
        options.components.push(...components);

        const message: Message = interaction.isMessageComponent()
            ? await InteractionHelper.update(interaction, options)
            : await InteractionHelper.reply(interaction, options);

        if (buttons.length === 0) {
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
                for (const component of components) {
                    let isFulfilled: boolean = false;

                    for (const row of m.components) {
                        if (
                            component.components.length !==
                            row.components.length
                        ) {
                            continue;
                        }

                        if (
                            row.components.every(
                                (c, i) =>
                                    c instanceof ButtonComponent &&
                                    c.customId ===
                                        (<APIButtonComponentWithCustomId>(
                                            buttons[i].data
                                        )).custom_id
                            )
                        ) {
                            isFulfilled = true;
                            break;
                        }
                    }

                    if (!isFulfilled) {
                        return false;
                    }
                }

                return true;
            }
        );

        const { collector } = collectorOptions;

        collector.on("collect", (i) =>
            onButtonPressedListener(collector, i, options)
        );
        collector.once("end", () =>
            onButtonCollectorEnd(collectorOptions, options)
        );

        return message;
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

        await onPageChange(options, startPage, ...onPageChangeArgs);

        return this.createLimitedTimeButtons(
            interaction,
            options,
            maxPage > 1 ? buttons : [],
            users,
            duration,
            async (_, i) => {
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

                const row = <ActionRowBuilder>options.components?.find((c) => {
                    c = <APIActionRowComponent<APIMessageActionRowComponent>>c;

                    return (
                        c.components.length === buttons.length &&
                        c.components.every(
                            (b, i) =>
                                b instanceof ButtonBuilder &&
                                (<APIButtonComponentWithCustomId>b.data)
                                    .custom_id ===
                                    (<APIButtonComponentWithCustomId>(
                                        buttons[i].data
                                    )).custom_id
                        )
                    );
                });

                row?.setComponents(
                    this.createPagingButtons(currentPage, maxPage)
                );

                if (options.embeds) {
                    for (let i = 0; i < options.embeds.length; ++i) {
                        const embed = options.embeds[i];

                        let data: APIEmbed;

                        if (isJSONEncodable(embed)) {
                            data = embed.toJSON();
                        } else {
                            data = embed;
                        }

                        if (data.fields) {
                            data.fields.length = 0;
                        }
                    }
                }

                await onPageChange(options, currentPage, ...onPageChangeArgs);

                await i.editReply(options);
            },
            async (c) => {
                const index: number = (<ActionRowBuilder<ButtonBuilder>[]>(
                    options.components
                )).findIndex((v) => {
                    return (
                        v.components.length === buttons.length &&
                        v.components.every(
                            (c, i) =>
                                (<APIButtonComponentWithCustomId>c.data)
                                    .custom_id ===
                                (<APIButtonComponentWithCustomId>(
                                    buttons[i].data
                                )).custom_id
                        )
                    );
                });

                if (index !== -1) {
                    options.components!.splice(index, 1);
                }

                if (!c.componentIsDeleted) {
                    try {
                        interaction.isMessageComponent()
                            ? await InteractionHelper.update(
                                  interaction,
                                  options
                              )
                            : await InteractionHelper.reply(
                                  interaction,
                                  options
                              );
                        // eslint-disable-next-line no-empty
                    } catch {}
                }
            }
        );
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
        CacheManager.exemptedButtonCustomIds.add("backward");
        CacheManager.exemptedButtonCustomIds.add("back");
        CacheManager.exemptedButtonCustomIds.add("none");
        CacheManager.exemptedButtonCustomIds.add("next");
        CacheManager.exemptedButtonCustomIds.add("forward");

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
        CacheManager.exemptedButtonCustomIds.add("yes");
        CacheManager.exemptedButtonCustomIds.add("no");

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
