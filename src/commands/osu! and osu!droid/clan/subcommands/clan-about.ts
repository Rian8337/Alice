import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setDescription(
        `Please go to [this](https://osudroidfaq.wordpress.com/clans/) website for guidelines.`
    );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
