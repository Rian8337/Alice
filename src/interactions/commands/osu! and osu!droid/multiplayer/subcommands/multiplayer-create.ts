import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { MultiplayerWinCondition } from "@alice-enums/multiplayer/MultiplayerWinCondition";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { TextChannel, ThreadChannel } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (!interaction.channel?.isText() || interaction.channel.isThread()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "commandNotAvailableInChannel"
                )
            ),
        });
    }

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 1,
                },
            }
        );

    if (room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfInRoom")
            ),
        });
    }

    const id: string = interaction.options.getString("id", true);

    if (
        await DatabaseManager.aliceDb.collections.multiplayerRoom.idIsTaken(id)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomWithIdAlreadyExists")
            ),
        });
    }

    const name: string = interaction.options.getString("name", true);

    const password: string | null = interaction.options.getString("password");

    if (id.length > 20) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("idTooLong")
            ),
        });
    }

    if (name.length > 50) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("nameTooLong")
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    "selfAccountNotBinded"
                )
            ),
        });
    }

    const thread: ThreadChannel = await (<TextChannel>(
        interaction.channel
    )).threads.create({
        name: `${localization.getTranslation(
            "multiplayerRoomPrefix"
        )} — ${id} - ${name}`,
        autoArchiveDuration: 60,
        reason: "User created multiplayer room",
    });

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.insert({
            roomId: id,
            textChannelId: interaction.channelId,
            threadChannelId: thread.id,
            players: [
                {
                    uid: bindInfo.uid,
                    username: bindInfo.username,
                    discordId: interaction.user.id,
                    isReady: false,
                    isSpectating: false,
                },
            ],
            settings: {
                roomName: name,
                roomHost: interaction.user.id,
                password: password ?? undefined,
                allowedMods: "",
                maxPlayers: interaction.options.getInteger("slotamount") ?? 8,
                beatmap: null,
                scorePortion: 0.4,
                allowSliderLock: false,
                modMultipliers: {},
                forcedAR: {
                    allowed: false,
                    minValue: 0,
                    maxValue: 12.5,
                },
                requiredMods: "",
                speedMultiplier: 1,
                teamMode: MultiplayerTeamMode.headToHead,
                winCondition: MultiplayerWinCondition.scoreV1,
            },
        });

    if (!result.success) {
        await thread.delete("Multiplayer room creation failed");

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("createRoomFailed")
            ),
        });
    }

    await thread.members.add(interaction.user, "User created multiplayer room");

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("createRoomSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
