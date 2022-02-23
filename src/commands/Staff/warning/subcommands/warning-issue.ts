import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { WarningLocalization } from "@alice-localization/commands/Staff/WarningLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { WarningManager } from "@alice-utils/managers/WarningManager";
import { GuildMember } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: WarningLocalization = new WarningLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const member: GuildMember | null = await interaction
        .guild!.members.fetch(interaction.options.getUser("user", true))
        .catch(() => null);

    if (!member) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userNotFoundInServer")
            ),
        });
    }

    const points: number = interaction.options.getInteger("points", true);

    const duration: number = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("validduration", true)
    );

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await WarningManager.issue(
        interaction,
        member,
        points,
        duration,
        reason
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("warnIssueFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("warnIssueSuccess")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
