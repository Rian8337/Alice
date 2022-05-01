import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

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
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation(
                    id ? "roomWithIdDoesntExist" : "roomDoesntExistInChannel"
                )
            ),
        });
    }

    interaction.editReply({
        embeds: [
            EmbedCreator.createMultiplayerRoomStatsEmbed(
                room,
                localization.language
            ),
        ],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
