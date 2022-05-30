import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MultiplayerRoom } from "@alice-database/utils/aliceDb/MultiplayerRoom";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MultiplayerLocalization } from "@alice-localization/commands/osu! and osu!droid/multiplayer/MultiplayerLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
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

    InteractionHelper.reply(interaction, {
        embeds: [room.getStatsEmbed(localization.language)],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
