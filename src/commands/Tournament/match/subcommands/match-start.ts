import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMapLengthInfo } from "@alice-database/utils/aliceDb/TournamentMapLengthInfo";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildMember, MessageEmbed } from "discord.js";
import { matchStrings } from "../matchStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const pick: string = interaction.options
        .getString("pick", true)
        .toUpperCase();

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
            interaction.channelId
        );

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.matchDoesntExist),
        });
    }

    const poolId: string = match.matchid.split(".").shift()!;

    const mappoolDurationData: TournamentMapLengthInfo | null =
        await DatabaseManager.aliceDb.collections.tournamentMapLengthInfo.getFromId(
            poolId
        );

    if (!mappoolDurationData) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.mappoolNotFound),
        });
    }

    const map = mappoolDurationData.map.find((m) => m[0] === pick);

    if (!map) {
        return interaction.editReply({
            content: MessageCreator.createReject(matchStrings.mapNotFound),
        });
    }

    const timeLimit: number = Math.ceil(
        parseInt(<string>map[1]) / (pick.includes("DT") ? 1.5 : 1)
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        timestamp: true,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle("Round Info")
        .addField("Match ID", match.matchid, true)
        .addField("Map", map[0], true)
        .addField(
            "Map Length",
            DateTimeFormatHelper.secondsToDHMS(timeLimit),
            true
        );

    interaction.editReply({
        content: MessageCreator.createAccept(matchStrings.roundInitiated),
        embeds: [embed],
    });

    setTimeout(() => {
        setTimeout(() => {
            interaction.channel!.send({
                content: MessageCreator.createAccept(matchStrings.roundEnded),
            });

            client.subcommands
                .get("match")!
                .get("match-submit")!
                .run(client, interaction);
        }, 30 * 1000);

        interaction.channel!.send({
            content: MessageCreator.createAccept(
                matchStrings.roundCountdownFinished
            ),
        });
    }, timeLimit * 1000);
};

export const config: Subcommand["config"] = {
    permissions: [],
};
