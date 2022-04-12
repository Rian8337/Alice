import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { AnyChannel, ThreadChannel } from "discord.js";
import { MatchLocalization } from "@alice-localization/commands/Tournament/match/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: MatchLocalization = new MatchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id);

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
        });
    }

    if (match.status === "completed") {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("matchHasEnded")
            ),
        });
    }

    const result: OperationResult =
        await DatabaseManager.elainaDb.collections.tournamentMatch.delete({
            matchid: match.matchid,
        });

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("removeMatchFailed"),
                result.reason!
            ),
        });
    }

    if (match.channelId) {
        const channel: AnyChannel | null = await client.channels.fetch(
            match.channelId
        );

        if (channel instanceof ThreadChannel) {
            await channel.setLocked(true);
            await channel.setArchived(true, "Match removed");
        }
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("removeMatchSuccessful"),
            match.matchid
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
