import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
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

    match.status = "completed";

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.endMatchFailed,
                result.reason!
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createMatchSummaryEmbed(match);

    interaction.editReply({
        content: MessageCreator.createAccept(
            matchStrings.endMatchSuccessful,
            match.matchid
        ),
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
