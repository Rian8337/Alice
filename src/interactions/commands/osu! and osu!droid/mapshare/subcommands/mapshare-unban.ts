import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MapshareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { User } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (interaction.channelId !== Constants.mapShareChannel) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.notAvailableInServerReject,
                ),
            ),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    const dbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await dbManager.getFromUser(user, {
        projection: { _id: 0, isBannedFromMapShare: 1 },
    });

    if (!playerInfo?.isBannedFromMapShare) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotBanned"),
            ),
        });
    }

    playerInfo.isBannedFromMapShare = false;

    const result = await dbManager.updateOne(
        { discordid: user.id },
        {
            $set: {
                isBannedFromMapShare: false,
            },
        },
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unbanFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unbanSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
