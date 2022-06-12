import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageEmbed } from "discord.js";
import { MatchLocalization } from "@alice-localization/interactions/commands/Tournament/match/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
        });
    }

    match.status = "completed";

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("endMatchFailed"),
                result.reason!
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createMatchSummaryEmbed(match);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("endMatchSuccessful"),
            match.matchid
        ),
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
