import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const shuffleMode: boolean = interaction.options.getBoolean("shuffle", true);

    const result: OperationResult = MusicManager.setShuffle(
        (<GuildMember> interaction.member).voice.channel!,
        shuffleMode
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.shuffleModeFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.shuffleModeSuccess, shuffleMode ? "enabled" : "disabled"
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};