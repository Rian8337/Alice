import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const repeatMode: boolean = interaction.options.getBoolean("repeat", true);

    const result: OperationResult = MusicManager.setRepeat(
        (<GuildMember>interaction.member).voice.channel!,
        repeatMode
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.repeatModeFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.repeatModeSuccess,
            repeatMode ? "enabled" : "disabled"
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
