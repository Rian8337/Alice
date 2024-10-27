import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WhitelistLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/whitelist/WhitelistLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { EmbedBuilder, GuildMember } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: WhitelistLocalization = new WhitelistLocalization(
        CommandHelper.getLocale(interaction),
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.setTitle(localization.getTranslation("filteringBeatmaps")).addFields(
        {
            name: localization.getTranslation("filterOptionsTitle"),
            value: localization.getTranslation("filterOptionsDescription"),
        },
        {
            name: localization.getTranslation("sortingOptionsTitle"),
            value: localization.getTranslation("sortingOptionsDescription"),
        },
        {
            name: localization.getTranslation("equalitySymbolsTitle"),
            value: localization.getTranslation("equalitySymbolsDescription"),
        },
        {
            name: localization.getTranslation("behaviorTitle"),
            value: localization.getTranslation("behaviorDescription"),
        },
        {
            name: localization.getTranslation("examplesTitle"),
            value: [
                localization.getTranslation("examplesDescription1"),
                localization.getTranslation("examplesDescription2"),
                localization.getTranslation("examplesDescription3"),
                localization.getTranslation("examplesDescription4"),
            ].join("\n\n"),
        },
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
