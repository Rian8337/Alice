import { Constants } from "@core/Constants";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DailyLocalization } from "@localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { GuildEmoji, GuildMember, EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization: DailyLocalization = new DailyLocalization(
        CommandHelper.getLocale(interaction),
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const coin: GuildEmoji = client.emojis.resolve(Constants.mahiruCoinEmote)!;

    embed
        .setTitle(localization.getTranslation("aboutTitle"))
        .setThumbnail("https://image.frl/p/beyefgeq5m7tobjg.jpg")
        .setDescription(
            StringHelper.formatString(
                localization.getTranslation("aboutDescription"),
                coin.toString(),
            ),
        )
        .addFields(
            {
                name: localization.getTranslation("aboutQuestion1"),
                value: StringHelper.formatString(
                    localization.getTranslation("aboutAnswer1"),
                    coin.toString(),
                    coin.toString(),
                    coin.toString(),
                    coin.toString(),
                ),
            },
            {
                name: localization.getTranslation("aboutQuestion1"),
                value: StringHelper.formatString(
                    localization.getTranslation("aboutAnswer1"),
                    coin.toString(),
                    coin.toString(),
                    coin.toString(),
                    coin.toString(),
                ),
            },
            {
                name: localization.getTranslation("aboutQuestion2"),
                value: localization.getTranslation("aboutAnswer2"),
            },
            {
                name: localization.getTranslation("aboutQuestion3"),
                value: StringHelper.formatString(
                    localization.getTranslation("aboutAnswer3"),
                    coin.toString(),
                ),
            },
            {
                name: localization.getTranslation("aboutQuestion4"),
                value: StringHelper.formatString(
                    localization.getTranslation("aboutAnswer4"),
                    coin.toString(),
                ),
            },
            {
                name: localization.getTranslation("aboutQuestion5"),
                value: localization.getTranslation("aboutAnswer5"),
            },
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};
