import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { User } from "discord.js";
import { Player } from "osu-droid";
import { recent5Strings } from "../recent5Strings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user", true);

    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject)
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(recent5Strings.playerNotFound)
        });
    }

    if (player.recentPlays.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(recent5Strings.playerHasNoRecentPlays)
        });
    }

    ScoreDisplayHelper.showRecentPlays(interaction, player);
};

export const config: Subcommand["config"] = {
    permissions: []
};