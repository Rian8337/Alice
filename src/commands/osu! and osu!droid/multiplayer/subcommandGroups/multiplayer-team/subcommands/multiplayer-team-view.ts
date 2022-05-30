import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { MultiplayerTeam } from "@alice-enums/multiplayer/MultiplayerTeam";
import { MultiplayerTeamMode } from "@alice-enums/multiplayer/MultiplayerTeamMode";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerPlayer } from "@alice-interfaces/multiplayer/MultiplayerPlayer";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: MultiplayerLocalization = new MultiplayerLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const room: MultiplayerRoom | null =
        await DatabaseManager.aliceDb.collections.multiplayerRoom.getFromChannel(
            interaction.channelId
        );

    if (!room) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomDoesntExistInChannel")
            ),
        });
    }

    if (room.settings.teamMode !== MultiplayerTeamMode.teamVS) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roomInHeadToHeadMode")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const redTeam: MultiplayerPlayer[] = [];
    const blueTeam: MultiplayerPlayer[] = [];

    for (const player of room.players) {
        switch (player.team) {
            case MultiplayerTeam.red:
                redTeam.push(player);
                break;
            case MultiplayerTeam.blue:
                blueTeam.push(player);
        }
    }

    embed
        .setTitle(localization.getTranslation("roomTeamMemberList"))
        .addField(
            localization.getTranslation("redTeam"),
            redTeam
                .map((v, i) => `${i + 1}. (${v.uid}) ${v.username}`)
                .join("\n") || "No players"
        )
        .addField(
            localization.getTranslation("blueTeam"),
            blueTeam
                .map((v, i) => `${i + 1}. (${v.uid}) ${v.username}`)
                .join("\n") || "No players"
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
