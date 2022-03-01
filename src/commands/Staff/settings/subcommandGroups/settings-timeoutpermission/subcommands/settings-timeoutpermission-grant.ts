import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { SettingsLocalization } from "@alice-localization/commands/Staff/settings/SettingsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Role } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const role: Role = <Role>interaction.options.getRole("role", true);

    const durationInput: string = interaction.options.getString(
        "duration",
        true
    );

    const duration: number =
        parseFloat(durationInput) ||
        DateTimeFormatHelper.DHMStoSeconds(durationInput);

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId
        );

    if (!guildConfig?.getGuildLogChannel(interaction.guild!)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noLogChannelConfigured")
            ),
        });
    }

    if (
        duration !== -1 &&
        !NumberHelper.isNumberInRange(
            duration,
            30,
            Number.POSITIVE_INFINITY,
            true
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("invalidTimeoutPermissionDuration")
            ),
        });
    }

    await guildConfig.grantTimeoutPermission(role.id, duration);

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("grantTimeoutPermissionSuccess"),
            role.name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
