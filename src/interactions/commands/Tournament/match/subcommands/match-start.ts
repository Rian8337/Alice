import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { TournamentBeatmap } from "structures/tournament/TournamentBeatmap";
import { MatchLocalization } from "@alice-localization/interactions/commands/Tournament/match/MatchLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: MatchLocalization = new MatchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const pick: string = interaction.options
        .getString("pick", true)
        .toUpperCase();

    const match: TournamentMatch | null =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
            interaction.channelId
        );

    if (!match) {
        return InteractionHelper.reply(interaction, {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("mappoolNotFound")
            ),
        });
    }

    const map: TournamentBeatmap | null = pool.getBeatmapFromPick(pick);

    if (!map) {
        return InteractionHelper.reply(interaction, {
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
        .addField(localization.getTranslation("map"), map.pickId, true)
        .addField(
            localization.getTranslation("mapLength"),
            DateTimeFormatHelper.secondsToDHMS(
                timeLimit,
                localization.language
            ),
            true
        );

    InteractionHelper.reply(interaction, {
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

            client.interactions.chatInput
                .get("match")!
                .subcommands.get("match-submit")!
                .run(client, interaction);
        }, 30 * 1000);

        interaction.channel!.send({
            content: MessageCreator.createAccept(
                localization.getTranslation("roundCountdownFinished")
            ),
        });
    }, timeLimit * 1000);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
