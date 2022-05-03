import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setDescription(
        new ClanLocalization(
            await CommandHelper.getLocale(interaction)
        ).getTranslation("guidelineWebsite") +
            "\n" +
            "https://osudroidfaq.wordpress.com/clans/"
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
