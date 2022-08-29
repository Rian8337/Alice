import {
    ActionRow,
    ActionRowBuilder,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    InteractionReplyOptions,
    Message,
    MessageActionRowComponent,
    SelectMenuBuilder,
    SelectMenuComponent,
    SelectMenuComponentOptionData,
    SelectMenuInteraction,
    Snowflake,
} from "discord.js";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { MessageCreator } from "./MessageCreator";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { MessageButtonCreator } from "./MessageButtonCreator";
import { Language } from "@alice-localization/base/Language";
import { SelectMenuCreatorLocalization } from "@alice-localization/utils/creators/SelectMenuCreator/SelectMenuCreatorLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { RepliableInteraction } from "@alice-structures/core/RepliableInteraction";

/**
 * A utility to create message select menus.
 */
export abstract class SelectMenuCreator extends InteractionCollectorCreator {
    /**
     * Creates a select menu.
     *
     * @param interaction The interaction that triggered the select menu.
     * @param options Message options to ask the user to choose.
     * @param choices The choices that the user can choose.
     * @param users The users who can interact with the select menu.
     * @param duration The duration the select menu will be active for.
     * @returns The interaction with the user.
     */
    static async createSelectMenu(
        interaction: RepliableInteraction,
        options: InteractionReplyOptions,
        choices: SelectMenuComponentOptionData[],
        users: Snowflake[],
        duration: number
    ): Promise<SelectMenuInteraction | null> {
        const localization: SelectMenuCreatorLocalization =
            this.getLocalization(await CommandHelper.getLocale(interaction));

        const selectMenu: SelectMenuBuilder = new SelectMenuBuilder()
            .setCustomId(interaction.user.id + "selectMenu")
            .addOptions(choices.slice(0, 25));

        const component: ActionRowBuilder<SelectMenuBuilder> =
            new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);

        const onPageChange: OnButtonPageChange = async (_, page) => {
            selectMenu.setOptions(
                choices.slice(25 * (page - 1), 25 + 25 * (page - 1))
            );

            component.setComponents(selectMenu);
        };

        options.components ??= [];
        options.components.push(component);

        const message: Message =
            await MessageButtonCreator.createLimitedButtonBasedPaging(
                interaction,
                options,
                [interaction.user.id],
                1,
                Math.ceil(choices.length / 25),
                duration,
                onPageChange
            );

        const collectorOptions = this.createSelectMenuCollector(
            message,
            duration,
            (i) =>
                selectMenu.data.custom_id === i.customId &&
                users.includes(i.user.id),
            (m) => {
                const row: ActionRow<MessageActionRowComponent> | undefined =
                    m.components.find((c) => c.components.length === 1);

                if (!row) {
                    return false;
                }

                return (
                    row.components[0] instanceof SelectMenuComponent &&
                    row.components[0].customId === selectMenu.data.custom_id
                );
            }
        );

        const { collector } = collectorOptions;

        collector.once("collect", () => {
            collector.stop();
        });

        return new Promise((resolve) => {
            collector.once("end", async (collected) => {
                const i: SelectMenuInteraction | undefined = collected.first();

                if (i) {
                    const index: number = (<
                        APIActionRowComponent<APIMessageActionRowComponent>[]
                    >options.components).findIndex((v) => {
                        return (
                            v.components.length === 1 &&
                            v.components[0] instanceof SelectMenuComponent &&
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
                                  localization.getTranslation("timedOut")
                              ),
                          })
                        : await InteractionHelper.reply(interaction, {
                              content: MessageCreator.createReject(
                                  localization.getTranslation("timedOut")
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
        language: Language
    ): SelectMenuCreatorLocalization {
        return new SelectMenuCreatorLocalization(language);
    }
}
