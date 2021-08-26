import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { Player } from "osu-droid";
import { recent5Strings } from "../recent5Strings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    const player: Player = await Player.getInformation({ uid: uid });

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