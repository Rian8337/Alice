import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Channel, ThreadChannel } from "discord.js";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const id: string = interaction.options.getString("id", true);

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id);

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.matchDoesntExist),
        });
    }

    if (match.status === "completed") {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.matchHasEnded),
        });
    }

    const result: OperationResult =
        await DatabaseManager.elainaDb.collections.tournamentMatch.delete({
            matchid: match.matchid,
        });

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.removeMatchFailed,
                result.reason!
            ),
        });
    }

    if (match.channelId) {
        const channel: Channel | null = await client.channels.fetch(
            match.channelId
        );

        if (channel instanceof ThreadChannel) {
            await channel.setArchived(true);
        }
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            matchStrings.removeMatchSuccessful,
            match.matchid
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
