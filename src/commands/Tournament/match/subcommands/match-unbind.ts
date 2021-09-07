import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ThreadChannel } from "discord.js";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id ?
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id) :
        await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(interaction.channelId);

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.matchDoesntExist)
        });
    }

    const thread: ThreadChannel | null = <ThreadChannel | null> (await client.channels.fetch(match.channelId))!;

    match.channelId = "";

    const result: DatabaseOperationResult = await match.updateMatch();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.unbindMatchFailed, result.reason!
            )
        });
    }

    if (thread && !thread.unarchivable) {
        await thread.setLocked(true);
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            matchStrings.unbindMatchSuccessful,
            match.matchid
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};