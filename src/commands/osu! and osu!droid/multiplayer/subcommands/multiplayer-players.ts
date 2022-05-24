import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const id: string | null = interaction.options.getString("id");

    const room: MultiplayerRoom | null = id
        ? await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromId(
              id
          )
        : await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromChannel(
              interaction.channelId
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

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
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

            embed.addField(
                `${i + 1}. ${player.username} (${player.uid})${
                    room.settings.roomHost === player.discordId
                        ? ` ${Symbols.crown}`
                        : ""
                }`,
                `**${localization.getTranslation(
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
                )}**`
            );
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

export const config: Subcommand["config"] = {
    permissions: [],
};
