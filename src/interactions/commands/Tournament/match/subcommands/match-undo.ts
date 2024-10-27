import { DatabaseManager } from "@database/DatabaseManager";
import { TournamentMatch } from "@database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MatchLocalization } from "@localization/interactions/commands/Tournament/match/MatchLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
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

    if (!match.result[0]) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("matchHasNoResult"),
            ),
        });
    }

    let team1Score: number = 0;
    let team2Score: number = 0;

    for (let i = 0; i < match.result.length; ++i) {
        const score: number = match.result[i].pop()!;

        if (i % 2 === 0) {
            team1Score += score;
        } else {
            team2Score += score;
        }
    }

    match.team[0][1] -= Number(team1Score > team2Score);
    match.team[1][1] -= Number(team2Score > team1Score);

    const result: OperationResult = await match.updateMatch();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("undoMatchFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("undoMatchSuccessful"),
            match.matchid,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
