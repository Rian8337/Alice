import { GuildMember } from "discord.js";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { muteStrings } from "../muteStrings";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const toMute: GuildMember = await interaction.guild!.members.fetch(
        interaction.options.getUser("user", true)
    );

    if (!toMute) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                muteStrings.userToMuteNotFound
            ),
        });
    }

    const duration: number = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("duration", true)
    );

    if (!Number.isFinite(duration)) {
        return interaction.editReply({
            content: MessageCreator.createReject(muteStrings.infiniteMuteError),
        });
    }

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await MuteManager.addMute(
        interaction,
        toMute,
        reason,
        duration
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                muteStrings.muteFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            muteStrings.temporaryMuteSuccess,
            DateTimeFormatHelper.secondsToDHMS(duration)
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["SPECIAL"],
};
