import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MapshareLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/mapshare/MapshareLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MapshareLocalization = new MapshareLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (interaction.channelId !== Constants.mapShareChannel) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.notAvailableInServerReject
                )
            ),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    const dbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await dbManager.getFromUser(user, {
        projection: { _id: 0, isBannedFromMapShare: 1 },
    });

    if (playerInfo?.isBannedFromMapShare) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsAlreadyBanned")
            ),
        });
    }

    let result: OperationResult;

    if (playerInfo) {
        playerInfo.isBannedFromMapShare = true;

        result = await dbManager.updateOne(
            { discordid: user.id },
            {
                $set: {
                    isBannedFromMapShare: true,
                },
            }
        );
    } else {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                user,
                {
                    projection: {
                        _id: 0,
                        uid: 1,
                        username: 1,
                    },
                }
            );

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    Constants.userNotBindedReject
                ),
            });
        }

        result = await dbManager.insert({
            uid: bindInfo.uid,
            username: bindInfo.username,
            discordid: bindInfo.discordid,
            isBannedFromMapShare: true,
        });
    }

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("banFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("banSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
