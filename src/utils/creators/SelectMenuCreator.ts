import { CommandInteraction, InteractionCollector, InteractionReplyOptions, Message, MessageActionRow, MessageComponentInteraction, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction, Snowflake } from "discord.js";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { MessageCreator } from "./MessageCreator";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MessageButtonCreator } from "./MessageButtonCreator";

/**
 * A utility to create message select menus.
 */
export abstract class SelectMenuCreator extends InteractionCollectorCreator {
    /**
     * Creates a select menu.
     * 
     * @param interaction The interaction that triggered the select menu.
     * @param placeholder The placeholder text of the select menu.
     * @param choices The choices that the user can choose.
     * @param users The users who can interact with the select menu.
     * @param duration The duration the select menu will be active for.
     * @returns The choices that the user picked.
     */
    static async createSelectMenu(interaction: CommandInteraction | MessageComponentInteraction, options: InteractionReplyOptions, choices: MessageSelectOptionData[], users: Snowflake[], duration: number): Promise<string[]> {
        const selectMenu: MessageSelectMenu = new MessageSelectMenu()
            .setCustomId("whatever")
            .addOptions(choices.slice(0, 25));

        const component: MessageActionRow = new MessageActionRow()
            .addComponents(selectMenu);

        const onPageChange: OnButtonPageChange = async (_, page) => {
            selectMenu.spliceOptions(0, selectMenu.options.length)
                .addOptions(choices.slice(25 * (page - 1), 25 + 25 * (page - 1)));

            component.spliceComponents(0, component.components.length)
                .addComponents(selectMenu);
        };

        options.components ??= [];
        options.components.push(component);

        const message: Message = await MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            options,
            [interaction.user.id],
            choices,
            25,
            1,
            duration,
            onPageChange
        );

        const collector: InteractionCollector<SelectMenuInteraction> =
            this.createSelectMenuCollector(message, users, duration);

        collector.on("collect", async i => {
            await i.deferUpdate();

            collector.stop();
        });

        return new Promise(resolve => {
            collector.on("end", async collected => {
                try {
                    if (collected.size > 0) {
                        await interaction.editReply({
                            content: MessageCreator.createAccept("Please wait..."),
                            components: []
                        });
                    } else {
                        await interaction.editReply({
                            content: MessageCreator.createReject("Timed out."),
                            components: []
                        });

                        setTimeout(() => {
                            interaction.deleteReply();
                        }, 5 * 1000);
                    }
                    // eslint-disable-next-line no-empty
                } catch { }

                resolve((<SelectMenuInteraction | undefined>collected.first())?.values ?? []);
            });
        });
    }
}