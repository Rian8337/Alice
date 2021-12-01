import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { mapshareStrings } from "../mapshareStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (interaction.channelId !== Constants.mapShareChannel) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                Constants.notAvailableInServerReject
            ),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    const dbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await dbManager.getFromUser(user);

    if (playerInfo?.isBannedFromMapShare) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.userIsAlreadyBanned
            ),
        });
    }

    let result: OperationResult;

    if (playerInfo) {
        playerInfo.isBannedFromMapShare = true;

        result = await dbManager.update(
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
                user
            );

        if (!bindInfo) {
            return interaction.editReply({
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
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.banFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(mapshareStrings.banSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
