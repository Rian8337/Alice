import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { TextBasedChannel, TextChannel, ThreadChannel } from "discord.js";
import { MatchLocalization } from "@alice-localization/commands/Tournament/match/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MatchLocalization = new MatchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const channel: TextBasedChannel = interaction.channel!;

    if (!(channel instanceof TextChannel)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("invalidChannelToBind")
            ),
        });
    }

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id);

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
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
        await thread.setLocked(false);
    }

    if (!thread.joined) {
        await thread.join();
    }

    match.channelId = thread.id;

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("bindMatchFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("bindMatchSuccessful"),
            id
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
