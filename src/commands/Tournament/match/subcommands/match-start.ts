import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { TournamentBeatmap } from "@alice-interfaces/tournament/TournamentBeatmap";
import { Language } from "@alice-localization/base/Language";
import { MatchLocalization } from "@alice-localization/commands/Tournament/match/MatchLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: MatchLocalization = new MatchLocalization(language);

    const pick: string = interaction.options
        .getString("pick", true)
        .toUpperCase();

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
            interaction.channelId
        );

    if (!match) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist")
            ),
        });
    }

    const poolId: string = match.matchid.split(".").shift()!;

    const pool: TournamentMappool | null =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            poolId
        );

    if (!pool) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("mappoolNotFound")
            ),
        });
    }

    const map: TournamentBeatmap | null = pool.getBeatmapFromPick(pick);

    if (!map) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("mapNotFound")
            ),
        });
    }

    const timeLimit: number = Math.ceil(
        map.duration / (pick.includes("DT") ? 1.5 : 1)
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        timestamp: true,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(localization.getTranslation("roundInfo"))
        .addField(localization.getTranslation("matchId"), match.matchid, true)
        .addField(localization.getTranslation("map"), map.pick, true)
        .addField(
            localization.getTranslation("mapLength"),
            DateTimeFormatHelper.secondsToDHMS(timeLimit, language),
            true
        );

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("roundInitiated")
        ),
        embeds: [embed],
    });

    setTimeout(() => {
        setTimeout(() => {
            interaction.channel!.send({
                content: MessageCreator.createAccept(
                    localization.getTranslation("roundEnded")
                ),
            });

            client.subcommands
                .get("match")!
                .get("match-submit")!
                .run(client, interaction);
        }, 30 * 1000);

        interaction.channel!.send({
            content: MessageCreator.createAccept(
                localization.getTranslation("roundCountdownFinished")
            ),
        });
    }, timeLimit * 1000);
};

export const config: Subcommand["config"] = {
    permissions: [],
};
