import { CommandInteraction, InteractionCollector, Message, MessageActionRow, MessageComponentInteraction, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction, Snowflake } from "discord.js";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { MessageCreator } from "./MessageCreator";

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
    static createSelectMenu(interaction: CommandInteraction, placeholder: string, choices: MessageSelectOptionData[], users: Snowflake[], duration: number): Promise<string[]> {
        return new Promise(async resolve => {
            const selectMenu: MessageSelectMenu = new MessageSelectMenu()
                .setCustomId("whatever")
                .setPlaceholder(placeholder)
                .addOptions(choices);

            const component: MessageActionRow = new MessageActionRow()
                .addComponents(selectMenu);

            const message: Message = <Message> await interaction.editReply({
                content: MessageCreator.createWarn("Please choose one of the options below."),
                components: [component]
            });

            const collector: InteractionCollector<MessageComponentInteraction> =
                this.createSelectMenuCollector(message, users, duration);

            collector.on("collect", () => {
                collector.stop();
            });

            collector.on("end", async collected => {
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

                resolve((<SelectMenuInteraction | undefined> collected.first())?.values ?? []);
            });
        });
    }
}