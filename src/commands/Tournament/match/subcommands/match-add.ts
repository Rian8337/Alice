import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const matchId: string = interaction.options.getString("id", true);

    const name: string = interaction.options.getString("name", true);

    const team1Name: string = interaction.options.getString("team1name", true);

    const team2Name: string = interaction.options.getString("team2name", true);

    const team1Players: string = interaction.options.getString(
        "team1players",
        true
    );

    const team2Players: string = interaction.options.getString(
        "team2players",
        true
    );

    if (matchId.split(".").length !== 2) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.invalidMatchID),
        });
    }

    const existingMatchCheck: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(
            matchId
        );

    if (existingMatchCheck) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.matchIDAlreadyTaken
            ),
        });
    }

    const matchData: Partial<DatabaseTournamentMatch> = {
        matchid: matchId,
        name: name,
        team: [
            [team1Name, 0],
            [team2Name, 0],
        ],
        player: [],
        result: [],
    };

    const splitRegex: RegExp = /\b[\w']+(?:[^\w\n]+[\w']+){0,1}\b/g;

    const team1PlayersInformation: RegExpMatchArray =
        team1Players.match(splitRegex) ?? [];

    const team2PlayersInformation: RegExpMatchArray =
        team2Players.match(splitRegex) ?? [];

    // Ensure the player difference between both teams don't exceed 1
    if (
        Math.abs(
            team1PlayersInformation.length - team2PlayersInformation.length
        ) > 1
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.teamPlayerCountDoNotBalance
            ),
        });
    }

    for (
        let i = 0;
        i < team1PlayersInformation.length + team2PlayersInformation.length;
        ++i
    ) {
        const teamInfo: [string, string] =
            <[string, string]>(
                (i % 2 === 0
                    ? team1PlayersInformation
                    : team2PlayersInformation)[Math.floor(i / 2)]?.split(" ")
            ) ?? [];

        if (teamInfo.length !== 2) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    matchStrings.invalidPlayerInformation,
                    teamInfo.join(" ")
                ),
            });
        }

        matchData.player!.push(teamInfo);
        matchData.result!.push([]);
    }

    const result: OperationResult =
        await DatabaseManager.elainaDb.collections.tournamentMatch.insert(
            matchData
        );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                matchStrings.addMatchFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            matchStrings.addMatchSuccessful,
            matchId
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
