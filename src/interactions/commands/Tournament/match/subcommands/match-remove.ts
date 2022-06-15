import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { AnyChannel, ThreadChannel } from "discord.js";
import { MatchLocalization } from "@alice-localization/interactions/commands/Tournament/match/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    const localization: MatchLocalization = new MatchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id);

    if (!match) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
        });
    }

    if (match.status === "completed") {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("matchHasEnded")
            ),
        });
    }

    const result: OperationResult =
        await DatabaseManager.elainaDb.collections.tournamentMatch.deleteOne({
            matchid: match.matchid,
        });

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
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

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("removeMatchSuccessful"),
            match.matchid
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
