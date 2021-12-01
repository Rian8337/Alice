import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const result: OperationResult = await MusicManager.skip(
        (<GuildMember>interaction.member).voice.channel!
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.skipTrackFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(musicStrings.skipTrackSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
