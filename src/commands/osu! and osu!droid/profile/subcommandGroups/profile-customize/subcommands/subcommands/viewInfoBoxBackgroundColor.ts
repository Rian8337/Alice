import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/profile/ProfileLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );
    const color: string = playerInfo?.picture_config.bgColor ?? "#008BFF";

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new ProfileLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("infoBoxBackgroundColorInfo"),
            color
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
