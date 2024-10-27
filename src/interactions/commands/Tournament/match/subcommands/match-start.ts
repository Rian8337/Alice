import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MatchLocalization } from "@localization/interactions/commands/Tournament/match/MatchLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { GuildMember, EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization = new MatchLocalization(
        CommandHelper.getLocale(interaction),
    );

    const pick = interaction.options.getString("pick", true).toUpperCase();

    const match =
        await DatabaseManager.elainaDb.collections.tournamentMatch.getByChannel(
            interaction.channelId,
        );

    if (!match) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("matchDoesntExist"),
            ),
        });
    }

    const poolId = match.matchid.split(".").shift()!;

    const pool =
        await DatabaseManager.elainaDb.collections.tournamentMappool.getFromId(
            poolId,
        );

    if (!pool) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("mappoolNotFound"),
            ),
        });
    }

    const map = pool.getBeatmapFromPick(pick);

    if (!map) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("mapNotFound"),
            ),
        });
    }

    const timeLimit: number = Math.ceil(
        map.duration / (pick.includes("DT") ? 1.5 : 1),
    );

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        timestamp: true,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(localization.getTranslation("roundInfo")).addFields(
        {
            name: localization.getTranslation("matchId"),
            value: match.matchid,
            inline: true,
        },
        {
            name: localization.getTranslation("map"),
            value: map.pickId,
            inline: true,
        },
        {
            name: localization.getTranslation("mapLength"),
            value: DateTimeFormatHelper.secondsToDHMS(
                timeLimit,
                localization.language,
            ),
            inline: true,
        },
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("roundInitiated"),
        ),
        embeds: [embed],
    });

    setTimeout(() => {
        if (!interaction.channel?.isSendable()) {
            return;
        }

        setTimeout(() => {
            if (!interaction.channel?.isSendable()) {
                return;
            }

            interaction.channel.send({
                content: MessageCreator.createAccept(
                    localization.getTranslation("roundEnded"),
                ),
            });

            client.interactions.chatInput
                .get("match")!
                .subcommands.get("match-submit")!
                .run(client, interaction);
        }, 30 * 1000);

        interaction.channel!.send({
            content: MessageCreator.createAccept(
                localization.getTranslation("roundCountdownFinished"),
            ),
        });
    }, timeLimit * 1000);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
