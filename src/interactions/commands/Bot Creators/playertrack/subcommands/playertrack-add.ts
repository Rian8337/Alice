import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { PlayertrackLocalization } from "@alice-localization/interactions/commands/Bot Creators/playertrack/PlayertrackLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    await DatabaseManager.elainaDb.collections.playerTracking.addPlayer(uid);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new PlayertrackLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("nowTrackingUid"),
            uid.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
