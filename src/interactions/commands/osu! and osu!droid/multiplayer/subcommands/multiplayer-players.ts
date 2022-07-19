import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { Symbols } from "@alice-enums/utils/Symbols";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DatabaseMultiplayerRoom } from "structures/database/aliceDb/DatabaseMultiplayerRoom";
import { MultiplayerPlayer } from "@alice-structures/multiplayer/MultiplayerPlayer";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { MultiplayerLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember, EmbedBuilder } from "discord.js";
import { FindOptions } from "mongodb";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string | null = interaction.options.getString("id");

    const findOptions: FindOptions<DatabaseMultiplayerRoom> = {
        projection: {
            _id: 0,
            players: 1,
            "settings.roomName": 1,
            "settings.roomHost": 1,
        },
    };

    const room: MultiplayerRoom | null = id
        ? await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromId(
              id,
              findOptions
          )
        : await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromChannel(
              interaction.channelId,
              findOptions
          );

    if (!room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    id ? "roomWithIdDoesntExist" : "roomDoesntExistInChannel"
                )
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .setTitle(room.settings.roomName)
        .setDescription(
            `**${localization.getTranslation("roomHost")}** <@${
                room.settings.roomHost
            }> (${room.settings.roomHost})`
        );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(room.players.length, 5 + 5 * (page - 1));
            ++i
        ) {
            const player: MultiplayerPlayer = room.players[i];

            embed.addFields({
                name: `${i + 1}. ${player.username} (${player.uid})${
                    room.settings.roomHost === player.discordId
                        ? ` ${Symbols.crown}`
                        : ""
                }`,
                value: `**${localization.getTranslation(
                    "playerDiscordAccount"
                )}**: <@${player.discordId}> (${
                    player.discordId
                })\n**${localization.getTranslation(
                    "playerState"
                )}**: ${localization.getTranslation(
                    player.isSpectating
                        ? "spectating"
                        : player.isReady
                        ? "ready"
                        : "notReady"
                )}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(room.players.length / 5),
        60,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
