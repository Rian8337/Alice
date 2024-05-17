import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MatchLocalization } from "@alice-localization/interactions/commands/Tournament/match/MatchLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
              interaction.channelId,
          );

    if (!match) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new MatchLocalization(
                    CommandHelper.getLocale(interaction),
                ).getTranslation("matchDoesntExist"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createMatchSummaryEmbed(match);

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
