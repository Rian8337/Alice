import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ThreadChannel } from "discord.js";
import { MatchLocalization } from "@alice-localization/commands/Tournament/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: MatchLocalization = new MatchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
              interaction.channelId
          );

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
        });
    }

    const thread: ThreadChannel | null = <ThreadChannel | null>(
        (await client.channels.fetch(match.channelId))!
    );

    match.channelId = "";

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("unbindMatchFailed"),
                result.reason!
            ),
        });
    }

    await interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("unbindMatchSuccessful"),
            match.matchid
        ),
    });

    if (thread && thread.manageable) {
        await thread.setLocked(true);
        await thread.setArchived(true);
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
