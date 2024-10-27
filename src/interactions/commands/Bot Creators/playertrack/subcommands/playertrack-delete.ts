import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { PlayertrackLocalization } from "@localization/interactions/commands/Bot Creators/playertrack/PlayertrackLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

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
