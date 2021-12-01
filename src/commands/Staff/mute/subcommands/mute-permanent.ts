import { GuildMember } from "discord.js";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { muteStrings } from "../muteStrings";
import { Subcommand } from "@alice-interfaces/core/Subcommand";

export const run: Subcommand["run"] = async (_, interaction) => {
    const toMute: GuildMember = await interaction.guild!.members.fetch(
        interaction.options.getUser("user", true)
    );

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await MuteManager.addMute(
        interaction,
        toMute,
        reason,
        Number.POSITIVE_INFINITY
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                muteStrings.muteFailed,
                <string>result.reason
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(muteStrings.permanentMuteSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
