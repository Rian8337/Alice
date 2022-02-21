import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { MapshareLocalization } from "@alice-localization/commands/osu! and osu!droid/MapshareLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: MapshareLocalization = new MapshareLocalization(language);

    if (interaction.channelId !== Constants.mapShareChannel) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(Constants.notAvailableInServerReject)
            ),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    const dbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await dbManager.getFromUser(user);

    if (!playerInfo || playerInfo.isBannedFromMapShare) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotBanned")
            ),
        });
    }

    playerInfo.isBannedFromMapShare = false;

    const result = await dbManager.update(
        { discordid: user.id },
        {
            $set: {
                isBannedFromMapShare: false,
            },
        }
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("unbanFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(localization.getTranslation("unbanSuccess")),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
