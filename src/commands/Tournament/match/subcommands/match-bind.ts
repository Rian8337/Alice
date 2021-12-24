import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { TextBasedChannel, TextChannel, ThreadChannel } from "discord.js";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const id: string = interaction.options.getString("id", true);

    const channel: TextBasedChannel = interaction.channel!;

    if (!(channel instanceof TextChannel)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.invalidChannelToBind
            ),
        });
    }

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id);

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.matchDoesntExist),
        });
    }

    await channel.threads.fetch();

    await channel.threads.fetchArchived();

    let thread: ThreadChannel | undefined = channel.threads.cache.find(
        (c) => c.name === `${match.matchid} ${match.name}`
    );

    if (!thread) {
        thread = await channel.threads.create({
            name: `${match.matchid} ${match.name}`,
        });
    } else if (thread.archived && thread.unarchivable) {
        await thread.setArchived(false);
    }

    if (!thread.joined) {
        await thread.join();
    }

    match.channelId = thread.id;

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.bindMatchFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            matchStrings.bindMatchSuccessful,
            id
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
