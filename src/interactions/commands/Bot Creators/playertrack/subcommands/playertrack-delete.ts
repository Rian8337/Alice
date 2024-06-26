import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { PlayertrackLocalization } from "@alice-localization/interactions/commands/Bot Creators/playertrack/PlayertrackLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    await DatabaseManager.elainaDb.collections.playerTracking.removePlayer(uid);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new PlayertrackLocalization(
                CommandHelper.getLocale(interaction),
            ).getTranslation("noLongerTrackingUid"),
            uid.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
