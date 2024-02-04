import {
    ActionRowBuilder,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    InteractionReplyOptions,
    RepliableInteraction,
    StringSelectMenuBuilder,
    SelectMenuComponentOptionData,
    StringSelectMenuComponent,
    StringSelectMenuInteraction,
    Snowflake,
    ComponentType,
    ChannelType,
    ChannelSelectMenuBuilder,
    ChannelSelectMenuInteraction,
    ChannelSelectMenuComponent,
} from "discord.js";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { MessageCreator } from "./MessageCreator";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { MessageButtonCreator } from "./MessageButtonCreator";
import { Language } from "@alice-localization/base/Language";
import { SelectMenuCreatorLocalization } from "@alice-localization/utils/creators/SelectMenuCreator/SelectMenuCreatorLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

/**
 * A utility to create message select menus.
 */
export abstract class SelectMenuCreator extends InteractionCollectorCreator {
    /**
     * Creates a string select menu.
     *
     * @param interaction The interaction that triggered the select menu.
     * @param options Message options to ask the user to choose.
     * @param choices The choices that the user can choose.
     * @param users The users who can interact with the select menu.
     * @param duration The duration the select menu will be active for.
     * @returns The interaction with the user.
     */
    static async createStringSelectMenu(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        choices: SelectMenuComponentOptionData[],
        users: readonly Snowflake[],
        duration: number,
    ): Promise<StringSelectMenuInteraction | null> {
        const localization = this.getLocalization(
            await CommandHelper.getLocale(interaction),
        );

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(interaction.user.id + "stringSelectMenu")
            .addOptions(choices.slice(0, 25));

        const component =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                selectMenu,
            );

        const onPageChange: OnButtonPageChange = async (_, page) => {
            selectMenu.setOptions(
                choices.slice(25 * (page - 1), 25 + 25 * (page - 1)),
            );

            component.setComponents(selectMenu);
        };

        options.components ??= [];
        options.components.push(component);

        const message =
            await MessageButtonCreator.createLimitedButtonBasedPaging(
                interaction,
                options,
                [interaction.user.id],
                1,
                Math.ceil(choices.length / 25),
                duration,
                onPageChange,
            );

        const collectorOptions =
            this.createSelectMenuCollector<ComponentType.StringSelect>(
                message,
                duration,
                (i) =>
                    i.isStringSelectMenu() &&
                    selectMenu.data.custom_id === i.customId &&
                    users.includes(i.user.id),
                (m) => {
                    const row = m.components.find(
                        (c) => c.components.length === 1,
                    );

                    if (!row) {
                        return false;
                    }

                    return (
                        row.components[0] instanceof
                            StringSelectMenuComponent &&
                        row.components[0].customId === selectMenu.data.custom_id
                    );
                },
            );

        const { collector } = collectorOptions;

        collector.once("collect", () => {
            collector.stop();
        });

        return new Promise((resolve) => {
            collector.once("end", async (collected) => {
                const i = collected.first();

                if (i) {
                    const index = (<
                        APIActionRowComponent<APIMessageActionRowComponent>[]
                    >options.components).findIndex((v) => {
                        return (
                            v.components.length === 1 &&
                            v.components[0] instanceof
                                StringSelectMenuComponent &&
                            v.components[0].customId ===
                                selectMenu.data.custom_id
                        );
                    });

                    if (index !== -1) {
                        options.components!.splice(index, 1);
                    }
                } else {
                    interaction.isMessageComponent()
                        ? await InteractionHelper.update(interaction, {
                              content: MessageCreator.createReject(
                                  localization.getTranslation("timedOut"),
                              ),
                          })
                        : await InteractionHelper.reply(interaction, {
                              content: MessageCreator.createReject(
                                  localization.getTranslation("timedOut"),
                              ),
                          });

                    if (!interaction.ephemeral) {
                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5 * 1000);
                    }
                }

                resolve(i ?? null);
            });
        });
    }

    /**
     * Creates a channel select menu that prompts the user to select a channel.
     *
     * @param interaction The interaction that triggered the select menu.
     * @param options Message options to ask the user to choose.
     * @param channelTypes The types of channels to be included in the select menu.
     * @param users The users who can interact with the select menu.
     * @param duration The duration the select menu will be active for.
     * @returns
     */
    static async createChannelSelectMenu(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        channelTypes: ChannelType[],
        users: readonly Snowflake[],
        duration: number,
    ): Promise<ChannelSelectMenuInteraction | null> {
        const localization = this.getLocalization(
            await CommandHelper.getLocale(interaction),
        );

        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId(interaction.user.id + "channelSelectMenu")
            .setChannelTypes(channelTypes);

        const component =
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
                selectMenu,
            );

        options.components ??= [];
        options.components.push(component);

        const message = interaction.isMessageComponent()
            ? await InteractionHelper.update(interaction, options)
            : await InteractionHelper.reply(interaction, options);

        const collectorOptions =
            this.createSelectMenuCollector<ComponentType.ChannelSelect>(
                message,
                duration,
                (i) =>
                    i.isChannelSelectMenu() &&
                    selectMenu.data.custom_id === i.customId &&
                    users.includes(i.user.id),
                (m) => {
                    const row = m.components.find(
                        (c) => c.components.length === 1,
                    );

                    if (!row) {
                        return false;
                    }

                    return (
                        row.components[0] instanceof
                            StringSelectMenuComponent &&
                        row.components[0].customId === selectMenu.data.custom_id
                    );
                },
            );

        const { collector } = collectorOptions;

        collector.once("collect", () => {
            collector.stop();
        });

        return new Promise((resolve) => {
            collector.once("end", async (collected) => {
                const i = collected.first();

                if (i) {
                    const index = (<
                        APIActionRowComponent<APIMessageActionRowComponent>[]
                    >options.components).findIndex((v) => {
                        return (
                            v.components.length === 1 &&
                            v.components[0] instanceof
                                ChannelSelectMenuComponent &&
                            v.components[0].customId ===
                                selectMenu.data.custom_id
                        );
                    });

                    if (index !== -1) {
                        options.components!.splice(index, 1);
                    }
                } else {
                    interaction.isMessageComponent()
                        ? await InteractionHelper.update(interaction, {
                              content: MessageCreator.createReject(
                                  localization.getTranslation("timedOut"),
                              ),
                          })
                        : await InteractionHelper.reply(interaction, {
                              content: MessageCreator.createReject(
                                  localization.getTranslation("timedOut"),
                              ),
                          });

                    if (!interaction.ephemeral) {
                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5 * 1000);
                    }
                }

                resolve(i ?? null);
            });
        });
    }

    /**
     * Gets the localization of this creator utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language,
    ): SelectMenuCreatorLocalization {
        return new SelectMenuCreatorLocalization(language);
    }
}
