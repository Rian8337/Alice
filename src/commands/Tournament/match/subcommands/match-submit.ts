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
import { ModDoubleTime, ModHidden, Player, Score } from "osu-droid";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const id: string | null = interaction.options.getString("id");

    const match: TournamentMatch | null = id
        ? await DatabaseManager.elainaDb.collections.tournamentMatch.getById(id)
        : await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
              interaction.channelId
          );

    // Need to make cross-compatibility since this command is also called from match-start
    if (!match) {
        interaction.replied
            ? interaction.channel!.send({
                  content: MessageCreator.createReject(
                      matchStrings.matchDoesntExist
                  ),
              })
            : interaction.editReply({
                  content: MessageCreator.createReject(
                      matchStrings.matchDoesntExist
                  ),
              });

        return;
    }

    const poolId: string = match.matchid.split(".").shift()!;

    const mappoolMainData: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            poolId
        );

    if (!mappoolMainData) {
        interaction.replied
            ? interaction.channel!.send({
                  content: MessageCreator.createReject(
                      matchStrings.mappoolNotFound
                  ),
              })
            : interaction.editReply({
                  content: MessageCreator.createReject(
                      matchStrings.mappoolNotFound
                  ),
              });

        return;
    }

    const mappoolDurationData: TournamentMapLengthInfo | null =
        await DatabaseManager.aliceDb.collections.tournamentMapLengthInfo.getFromId(
            poolId
        );

    if (!mappoolDurationData) {
        interaction.replied
            ? interaction.channel!.send({
                  content: MessageCreator.createReject(
                      matchStrings.mappoolNotFound
                  ),
              })
            : interaction.editReply({
                  content: MessageCreator.createReject(
                      matchStrings.mappoolNotFound
                  ),
              });

        return;
    }

    const playerList: Player[] = [];

    for await (const p of match.player) {
        const player: Player = await Player.getInformation({
            uid: parseInt(p[1]),
        });

        if (!player.username) {
            interaction.replied
                ? interaction.channel!.send({
                      content: MessageCreator.createReject(
                          matchStrings.playerNotFound,
                          p[1]
                      ),
                  })
                : interaction.editReply({
                      content: MessageCreator.createReject(
                          matchStrings.playerNotFound,
                          p[1]
                      ),
                  });

            return;
        }

        playerList.push(player);
    }

    // Find latest played beatmap if not set
    const index: number = match.getLastPlayedBeatmap(
        mappoolMainData,
        mappoolDurationData,
        playerList,
        interaction.options.getString("pick")?.toUpperCase()
    );

    if (index === -1) {
        interaction.replied
            ? interaction.channel!.send({
                  content: MessageCreator.createReject(
                      matchStrings.mapNotFound
                  ),
              })
            : interaction.editReply({
                  content: MessageCreator.createReject(
                      matchStrings.mapNotFound
                  ),
              });

        return;
    }

    const map: MainBeatmapData = mappoolMainData.map[index];

    const scoreList: number[] = [];

    let team1String: string = "";
    let team2String: string = "";
    let team1OverallScore: number = 0;
    let team2OverallScore: number = 0;

    for (let i = 0; i < playerList.length; ++i) {
        const score: Score = playerList[i].recentPlays[0];

        const verificationResult: OperationResult = match.verifyScore(
            score,
            map,
            mappoolMainData.forcePR
        );

        if (verificationResult.success) {
            let scorev2: number = match.calculateScoreV2(
                score.score,
                score.accuracy.value(),
                score.accuracy.nmiss,
                parseInt(<string>map[2]),
                map[4] ?? 0.6
            );

            if (
                score.mods.filter(
                    (m) => m instanceof ModHidden || m instanceof ModDoubleTime
                ).length >= 2
            ) {
                scorev2 /= 0.59 / 0.56;
            }

            scoreList.push(Math.round(scorev2));
        } else {
            scoreList.push(0);
        }

        const scoreString: string = `${match.player[i][0]} - (${score.mods
            .map((v) => v.name)
            .join(", ")}): **${scoreList.at(-1)!}** - ${score.rank} - ${(
            score.accuracy.value() * 100
        ).toFixed(2)}% - ${score.accuracy.nmiss} misses\n`;
        const failString: string = `${match.player[i][0]} - (N/A): **0** - **${verificationResult.reason}**`;

        if (i % 2 === 0) {
            team1OverallScore += scoreList.at(-1)!;

            if (verificationResult.success) {
                team1String += scoreString;
            } else {
                team1String += failString;
            }
        } else {
            team2OverallScore += scoreList.at(-1)!;

            if (verificationResult.success) {
                team2String += scoreString;
            } else {
                team2String += failString;
            }
        }
    }

    team1String ||= "None";
    team2String ||= "None";

    let description: string = `${
        team1OverallScore > team2OverallScore
            ? match.team[0][0]
            : match.team[1][0]
    } won by ${Math.abs(team1OverallScore - team2OverallScore)}`;
    let embedColor: number = 0;

    if (team1OverallScore > team2OverallScore) {
        embedColor = 16711680;
    } else if (team1OverallScore < team2OverallScore) {
        embedColor = 262399;
    } else {
        description = "It's a draw";
    }

    const resultEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
        timestamp: true,
        color: embedColor,
    });

    resultEmbed
        .setAuthor(match.name)
        .setTitle(map[1])
        .addField(`${match.team[0][0]}: ${team1OverallScore}`, team1String)
        .addField(`${match.team[1][0]}: ${team2OverallScore}`, team2String)
        .addField("=================================", `**${description}**`);

    if (!interaction.replied) {
        await interaction.editReply({
            content: MessageCreator.createAccept(
                matchStrings.matchDataInProcess
            ),
        });
    }

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
        return interaction.channel!.send({
            content: MessageCreator.createReject(
                matchStrings.submitMatchFailed,
                finalResult.reason!
            ),
        });
    }

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            matchStrings.submitMatchSuccessful
        ),
        embeds: [resultEmbed, summaryEmbed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
