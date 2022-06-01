import {
    BaseCommandInteraction,
    InteractionReplyOptions,
    Message,
    MessageActionRow,
    MessageComponentInteraction,
    MessageSelectMenu,
    MessageSelectOptionData,
    Snowflake,
} from "discord.js";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { MessageCreator } from "./MessageCreator";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
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
     * Creates a select menu.
     *
     * @param interaction The interaction that triggered the select menu.
     * @param options Message options to ask the user to choose.
     * @param choices The choices that the user can choose.
     * @param users The users who can interact with the select menu.
     * @param duration The duration the select menu will be active for.
     * @returns The choices that the user picked.
     */
    static async createSelectMenu(
        interaction: BaseCommandInteraction | MessageComponentInteraction,
        options: InteractionReplyOptions,
        choices: MessageSelectOptionData[],
        users: Snowflake[],
        duration: number
    ): Promise<string[]> {
        const localization: SelectMenuCreatorLocalization =
            this.getLocalization(await CommandHelper.getLocale(interaction));

        const selectMenu: MessageSelectMenu = new MessageSelectMenu()
            .setCustomId(interaction.user.id + "selectMenu")
            .addOptions(choices.slice(0, 25));

        const component: MessageActionRow =
            new MessageActionRow().addComponents(selectMenu);

        const onPageChange: OnButtonPageChange = async (_, page) => {
            selectMenu
                .spliceOptions(0, selectMenu.options.length)
                .addOptions(
                    choices.slice(25 * (page - 1), 25 + 25 * (page - 1))
                );

            component
                .spliceComponents(0, component.components.length)
                .addComponents(selectMenu);
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
                selectMenu.customId === i.customId && users.includes(i.user.id),
            (m) => {
                const row: MessageActionRow | undefined = m.components.find(
                    (c) => c.components.length === 1
                );

                if (!row) {
                    return false;
                }

                return (
                    row.components[0] instanceof MessageSelectMenu &&
                    row.components[0].customId === selectMenu.customId
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
                if (collected.size > 0) {
                    const index: number = options.components!.findIndex((v) => {
                        return (
                            v.components.length === 1 &&
                            v.components[0] instanceof MessageSelectMenu &&
                            v.components[0].customId === selectMenu.customId
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

                resolve(collected.first()?.values ?? []);
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
