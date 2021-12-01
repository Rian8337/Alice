import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageEmbed } from "discord.js";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
              interaction.channelId
          );

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.matchDoesntExist),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createMatchSummaryEmbed(match);

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
