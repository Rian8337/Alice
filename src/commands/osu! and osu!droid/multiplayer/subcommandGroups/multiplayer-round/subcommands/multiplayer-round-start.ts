import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StarRatingCalculationParameters } from "@alice-utils/dpp/StarRatingCalculationParameters";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { MapStats, ModUtil } from "@rian8337/osu-base";
import { MessageEmbed, MessageOptions } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user
        );

    if (!room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfNotInRoom")
            ),
        });
    }

    if (room.settings.roomHost !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "noPermissionToExecuteCommand"
                )
            ),
        });
    }

    if (room.status.isPlaying) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomIsInPlayingStatus")
            ),
        });
    }

    const roomHost: MultiplayerPlayer = room.players.find(
        (p) => p.discordId === interaction.user.id
    )!;

    if (roomHost.isSpectating && room.players.length <= 1) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooFewPlayers")
            ),
        });
    }

    if (!room.settings.beatmap) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapPicked")
            ),
        });
    }

    if (CacheManager.multiplayerTimers.has(room.channelId)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("timerIsSet")
            ),
        });
    }

    if (!(interaction.options.getBoolean("force") ?? false)) {
        const unreadyPlayers: MultiplayerPlayer[] = room.players.filter(
            (p) => !p.isReady && !p.isSpectating
        );

        if (unreadyPlayers.length > 0) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("playerNotReady"),
                    unreadyPlayers.map((p) => p.username).join(", ")
                ),
            });
        }
    }

    room.status.isPlaying = true;

    const result: OperationResult = await room.updateRoom();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roundStartFailed")
            ),
        });
    }

    const duration: number = interaction.options.getInteger("duration") ?? 15;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    const timeout: NodeJS.Timeout = setTimeout(async () => {
        const embed: MessageEmbed =
            EmbedCreator.createMultiplayerRoomStatsEmbed(
                room,
                localization.language
            );

        embed.setTitle(localization.getTranslation("roundInfo"));

        const stats: MapStats = new MapStats({
            mods: ModUtil.pcStringToMods(room.settings.requiredMods),
            speedMultiplier: room.settings.speedMultiplier,
        });

        room.status.playingSince = Date.now();

        const result: OperationResult = await room.updateRoom();

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("roundStartFailed"),
                    result.reason!
                ),
            });
        }

        await interaction.channel!.send({
            content: MessageCreator.createAccept(
                localization.getTranslation("roundStarted")
            ),
            embeds: [embed],
        });

        CacheManager.multiplayerTimers.delete(room.channelId);

        setTimeout(() => {
            setTimeout(async () => {
                // Room may have been deleted or thread may have been archived.
                if (
                    interaction.channel?.isThread() &&
                    interaction.channel.archived
                ) {
                    // Assume that players are AFK or room was force-shutdown by someone with moderating permissions. Close the room.
                    await DatabaseManager.aliceDb.collections.multiplayerRoom.delete(
                        {
                            channelId: interaction.channelId,
                        }
                    );

                    if (!interaction.channel.locked) {
                        await interaction.channel.setLocked(
                            true,
                            "Multiplayer room closed"
                        );
                    }

                    return;
                }

                const room: MultiplayerRoom | null =
                    await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromChannel(
                        interaction.channelId
                    );

                if (!room) {
                    return;
                }

                const embed: MessageEmbed =
                    await EmbedCreator.createMultiplayerRoomRoundResultEmbed(
                        room,
                        localization.language
                    );

                for (const player of room.players) {
                    player.isReady = false;
                }

                room.status.isPlaying = false;
                room.status.playingSince = Date.now();
                room.currentScores = [];

                const result: OperationResult = await room.updateRoom();

                if (!result.success) {
                    return interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                "matchStatusUpdateFailed"
                            ),
                            result.reason!
                        ),
                    });
                }

                const options: MessageOptions = EmbedCreator.createBeatmapEmbed(
                    (await BeatmapManager.getBeatmap(
                        room.settings.beatmap!.id,
                        false
                    ))!,
                    new StarRatingCalculationParameters(
                        new MapStats({
                            mods: ModUtil.pcStringToMods(
                                room.settings.requiredMods
                            ),
                            speedMultiplier: room.settings.speedMultiplier,
                        })
                    )
                );

                options.embeds!.unshift(embed);

                interaction.channel!.send({
                    ...options,
                    content: MessageCreator.createAccept(
                        localization.getTranslation("matchStatusUpdateSuccess")
                    ),
                });
            }, 30 * 1000);

            interaction.channel!.send({
                content: MessageCreator.createAccept(
                    localization.getTranslation("roundCountdownFinished")
                ),
            });
        }, (room.settings.beatmap!.duration / stats.speedMultiplier) * 1000);
    }, duration * 1000);

    CacheManager.multiplayerTimers.set(room.channelId, timeout);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("roundStartSuccess"),
            duration.toLocaleString(BCP47)
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
