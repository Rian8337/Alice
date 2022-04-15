import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WhitelistLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/whitelist/WhitelistLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: WhitelistLocalization = new WhitelistLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .setTitle(localization.getTranslation("filteringBeatmaps"))
        .addField(
            localization.getTranslation("filterOptionsTitle"),
            localization.getTranslation("filterOptionsDescription")
        )
        .addField(
            localization.getTranslation("sortingOptionsTitle"),
            localization.getTranslation("sortingOptionsDescription")
        )
        .addField(
            localization.getTranslation("equalitySymbolsTitle"),
            localization.getTranslation("equalitySymbolsDescription")
        )
        .addField(
            localization.getTranslation("behaviorTitle"),
            localization.getTranslation("behaviorDescription")
        )
        .addField(
            localization.getTranslation("examplesTitle"),
            [
                localization.getTranslation("examplesDescription1"),
                localization.getTranslation("examplesDescription2"),
                localization.getTranslation("examplesDescription3"),
                localization.getTranslation("examplesDescription4"),
            ].join("\n\n")
        );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
