import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    "picture_config.textColor": 1,
                },
            },
        );

    const color: string = playerInfo?.picture_config.textColor ?? "#008BFF";

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            new ProfileLocalization(
                CommandHelper.getLocale(interaction),
            ).getTranslation("infoBoxTextColorInfo"),
            color,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
