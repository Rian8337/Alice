import { Collection, MessageEmbed } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { namechangeStrings } from "../namechangeStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";

export const run: Subcommand["run"] = async (_, interaction) => {
    const nameChanges: Collection<number, NameChange> =
        await DatabaseManager.aliceDb.collections.nameChange.getActiveNameChangeRequests();

    if (nameChanges.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.noActiveRequest
            ),
        });
    }

    nameChanges.sort((a, b) => {
        return a.cooldown - b.cooldown;
    });

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: "#cb9000",
    });

    embed.setTitle("Name Change Request List");

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: NameChange[]
    ) => {
        for (let i = 10 * (page - 1); i < 10 + 10 * (page - 1); ++i) {
            const content: NameChange = contents[i];

            if (content) {
                embed.addField(
                    `**${i + 1}**. **Uid ${content.uid}**`,
                    `**Discord Account**: <@${content.discordid}> (${content.discordid})\n` +
                        `**Username Requested**: ${content.new_username}\n` +
                        `**Creation Date**: ${new Date(
                            (content.cooldown - 86400 * 30) * 1000
                        ).toUTCString()}`
                );
            }
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...nameChanges.values()],
        10,
        1,
        60,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
