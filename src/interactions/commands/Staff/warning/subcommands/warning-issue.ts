import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WarningLocalization } from "@localization/interactions/commands/Staff/warning/WarningLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { WarningManager } from "@utils/managers/WarningManager";
import { GuildMember } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: WarningLocalization = new WarningLocalization(
        CommandHelper.getLocale(interaction),
    );

    const member: GuildMember | null = await interaction
        .guild!.members.fetch(interaction.options.getUser("user", true))
        .catch(() => null);

    if (!member) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotFoundInServer"),
            ),
        });
    }

    const points: number = interaction.options.getInteger("points", true);

    const duration: number = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("validduration", true),
    );

    const reason: string = interaction.options.getString("reason", true);

    await InteractionHelper.deferReply(interaction);

    const result: OperationResult = await WarningManager.issue(
        interaction,
        member,
        points,
        duration,
        reason,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warnIssueFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("warnIssueSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
