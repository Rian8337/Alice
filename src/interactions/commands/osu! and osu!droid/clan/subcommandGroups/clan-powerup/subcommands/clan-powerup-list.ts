import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember, EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        CommandHelper.getLocale(interaction),
    );

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user,
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(
        `${localization.getTranslation("ownedPowerups")} ${clan.name}`,
    );

    for (const powerup of clan.powerups.values()) {
        embed.addFields({
            name: StringHelper.capitalizeString(powerup.name),
            value: powerup.amount.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language),
            ),
            inline: true,
        });
    }

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
