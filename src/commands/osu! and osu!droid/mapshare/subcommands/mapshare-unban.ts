import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
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

    if (!playerInfo || playerInfo.isBannedFromMapShare) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                mapshareStrings.userIsNotBanned
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
                mapshareStrings.unbanFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(mapshareStrings.unbanSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
