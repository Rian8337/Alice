import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MatchLocalization } from "@alice-localization/commands/Tournament/match/MatchLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MessageEmbed } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
              interaction.channelId
          );

    if (!match) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new MatchLocalization(
                    await CommandHelper.getLocale(interaction)
                ).getTranslation("matchDoesntExist")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createMatchSummaryEmbed(match);

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
