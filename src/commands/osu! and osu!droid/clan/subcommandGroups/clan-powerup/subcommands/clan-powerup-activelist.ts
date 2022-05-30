import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(
        `${localization.getTranslation("activePowerups")} ${clan.name}`
    );

    let desc: string = "";

    for (let i = 0; i < clan.active_powerups.length; ++i) {
        desc += `**${i + 1}**. ${StringHelper.capitalizeString(
            clan.active_powerups[i]
        )}\n`;
    }

    embed.setDescription(desc);

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
