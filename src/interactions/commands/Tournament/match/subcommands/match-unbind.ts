import { DatabaseManager } from "@database/DatabaseManager";
import { TournamentMatch } from "@database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ThreadChannel } from "discord.js";
import { MatchLocalization } from "@localization/interactions/commands/Tournament/match/MatchLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization: MatchLocalization = new MatchLocalization(
        CommandHelper.getLocale(interaction),
    );

    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
              interaction.channelId,
          );

    if (!match) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist"),
            ),
        });
    }

    const thread: ThreadChannel | null = <ThreadChannel | null>(
        (await client.channels.fetch(match.channelId))!
    );

    match.channelId = "";

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unbindMatchFailed"),
                result.reason!,
            ),
        });
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unbindMatchSuccessful"),
            match.matchid,
        ),
    });

    if (thread && thread.manageable) {
        await thread.setLocked(true);
        await thread.setArchived(true, "Match ended");
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
