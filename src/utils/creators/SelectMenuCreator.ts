import {
    BaseCommandInteraction,
    InteractionCollector,
    InteractionReplyOptions,
    Message,
    MessageActionRow,
    MessageComponentInteraction,
    MessageSelectMenu,
    MessageSelectOptionData,
    SelectMenuInteraction,
    Snowflake,
} from "discord.js";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { MessageCreator } from "./MessageCreator";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageButtonCreator } from "./MessageButtonCreator";
import { Language } from "@alice-localization/base/Language";
import { SelectMenuCreatorLocalization } from "@alice-localization/utils/creators/SelectMenuCreator/SelectMenuCreatorLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

/**
 * A utility to create message select menus.
 */
export abstract class SelectMenuCreator extends InteractionCollectorCreator {
    /**
     * Creates a select menu.
     *
     * @param interaction The interaction that triggered the select menu.
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
            .setCustomId("whatever")
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

        const collector: InteractionCollector<SelectMenuInteraction> =
            this.createSelectMenuCollector(message, users, duration);

        collector.on("collect", async (i) => {
            await i.deferUpdate();

            collector.stop();
        });

        return new Promise((resolve) => {
            collector.on("end", async (collected) => {
                if (collected.size > 0) {
                    await interaction.editReply({
                        content: MessageCreator.createAccept(
                            localization.getTranslation("pleaseWait")
                        ),
                        components: [],
                    });
                } else {
                    await interaction.editReply({
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

                resolve(
                    (<SelectMenuInteraction | undefined>collected.first())
                        ?.values ?? []
                );
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
