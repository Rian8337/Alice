import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MatchLocalization } from "@alice-localization/commands/Tournament/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MatchLocalization = new MatchLocalization(await CommandHelper.getLocale(interaction));

    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
            interaction.channelId
        );

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("matchDoesntExist")),
        });
    }

    if (!match.result[0]) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("matchHasNoResult")),
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
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("undoMatchFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("undoMatchSuccessful"),
            match.matchid
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
