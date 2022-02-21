import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMapLengthInfo } from "@alice-database/utils/aliceDb/TournamentMapLengthInfo";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MainBeatmapData } from "@alice-types/tournament/MainBeatmapData";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageEmbed } from "discord.js";
import { Symbols } from "@alice-enums/utils/Symbols";
import { MatchLocalization } from "@alice-localization/commands/Tournament/MatchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MatchLocalization = new MatchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string = interaction.options.getString("id", true);

    const pick: string = interaction.options.getString("pick", true);

    const splitRegex: RegExp = /\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g;

    const team1Scores: string[] =
        interaction.options.getString("team1scores", true).match(splitRegex) ??
        [];

    const team2Scores: string[] =
        interaction.options.getString("team2scores", true).match(splitRegex) ??
        [];

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id);

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
        });
    }

    if (Math.ceil(match.player.length / 2) !== team1Scores.length) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("teamPlayerCountDoesntMatch"),
                "1",
                Math.ceil(match.player.length / 2).toLocaleString(),
                team1Scores.length.toLocaleString()
            ),
        });
    }

    if (Math.floor(match.player.length / 2) !== team2Scores.length) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("teamPlayerCountDoesntMatch"),
                "2",
                Math.floor(match.player.length / 2).toLocaleString(),
                team2Scores.length.toLocaleString()
            ),
        });
    }

    const mappoolDurationData: TournamentMapLengthInfo | null =
        await DatabaseManager.aliceDb.collections.tournamentMapLengthInfo.getFromId(
            match.matchid.split(".").shift()!
        );

    if (!mappoolDurationData) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("mappoolNotFound")
            ),
        });
    }

    const mappoolMainData: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            mappoolDurationData.poolid
        );

    if (!mappoolMainData) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("mappoolNotFound")
            ),
        });
    }

    const pickIndex: number = mappoolDurationData.map.findIndex(
        (m) => m[0].toUpperCase() === pick.toUpperCase()
    );

    if (pickIndex === -1) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("mapNotFound")
            ),
        });
    }

    const mapData: MainBeatmapData = mappoolMainData.map[pickIndex];

    const scoreList: number[] = [];

    let team1OverallScore: number = 0;
    let team2OverallScore: number = 0;
    let team1String: string = "";
    let team2String: string = "";

    for (let i = 0; i < match.player.length; ++i) {
        const scoreData: string[] =
            (i % 2 === 0 ? team1Scores : team2Scores)[Math.floor(i / 2)]?.split(
                " "
            ) ?? [];

        if (
            scoreData.length !== 3 ||
            scoreData.map((v) => parseFloat(v)).some(isNaN)
        ) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("scoreDataInvalid"),
                    ((i % 2) + 1).toLocaleString(),
                    Math.floor(i / 2).toLocaleString(),
                    scoreData.join(" ")
                ),
            });
        }

        let scoreV2: number = match.calculateScoreV2(
            parseInt(scoreData[0]),
            parseFloat(scoreData[1]) / 100,
            parseInt(scoreData[2]),
            parseInt(<string>mapData[2]),
            mapData[4] ?? 0.6
        );

        if (mapData[0] === "dt" && scoreData[0].endsWith("h")) {
            scoreV2 /= 0.59 / 0.56;
        }

        scoreV2 = Math.round(scoreV2);

        scoreList.push(scoreV2);

        const scoreString: string = `${
            match.player[i][0]
        } - (N/A): **${scoreV2}** - ${parseFloat(scoreData[1]).toFixed(2)}% - ${
            scoreData[2]
        } ${Symbols.missIcon}\n`;
        const failString: string = `${
            match.player[i][0]
        } - (N/A): **0** - **${localization.getTranslation("failed")}**`;

        if (i % 2 === 0) {
            team1OverallScore += scoreV2;
            team1String += scoreV2 ? scoreString : failString;
        } else {
            team2OverallScore += scoreV2;
            team2String += scoreV2 ? scoreString : failString;
        }
    }

    team1String ||= localization.getTranslation("none");
    team2String ||= localization.getTranslation("none");

    let embedColor: number = 0;
    let description: string = StringHelper.formatString(
        localization.getTranslation("won"),
        team1OverallScore > team2OverallScore
            ? match.team[0][0]
            : match.team[1][0],
        Math.abs(team1OverallScore - team2OverallScore).toLocaleString()
    );

    if (team1OverallScore > team2OverallScore) {
        embedColor = 16711680;
    } else if (team1OverallScore < team2OverallScore) {
        embedColor = 262399;
    } else {
        description = localization.getTranslation("draw");
    }

    const resultEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
        timestamp: true,
        color: embedColor,
    });

    resultEmbed
        .setAuthor({
            name: match.name,
        })
        .setTitle(mapData[1])
        .addField(`${match.team[0][0]}: ${team1OverallScore}`, team1String)
        .addField(`${match.team[1][0]}: ${team2OverallScore}`, team2String)
        .addField("=================================", `**${description}**`);

    // Red team wins
    match.team[0][1] += Number(team1OverallScore > team2OverallScore);
    // Blue team wins
    match.team[1][1] += Number(team2OverallScore > team1OverallScore);

    const summaryEmbed: MessageEmbed =
        EmbedCreator.createMatchSummaryEmbed(match);

    for (let i = 0; i < scoreList.length; ++i) {
        match.result[i].push(scoreList[i]);
    }

    const finalResult: OperationResult = await match.updateMatch();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("submitMatchFailed"),
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("submitMatchSuccessful")
        ),
        embeds: [resultEmbed, summaryEmbed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
