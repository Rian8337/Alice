import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { RoleTimeoutPermission } from "structures/moderation/RoleTimeoutPermission";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { SettingsLocalization } from "@alice-localization/interactions/commands/Staff/settings/SettingsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Collection, EmbedBuilder, roleMention } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: SettingsLocalization = new SettingsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId
        );

    if (!guildConfig) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noLogChannelConfigured")
            ),
        });
    }

    const allowedTimeoutRoles: Collection<string, RoleTimeoutPermission> =
        guildConfig.allowedTimeoutRoles;

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed.setTitle(localization.getTranslation("rolesWithTimeoutPermission"));

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const list: string[] = [];

        for (
            let i = 10 * (page - 1);
            i < Math.min(allowedTimeoutRoles.size, 10 + 10 * (page - 1));
            ++i
        ) {
            const timeoutRole: RoleTimeoutPermission =
                allowedTimeoutRoles.at(i)!;

            list.push(
                `- ${roleMention(timeoutRole.id)} (${
                    timeoutRole.maxTime === -1
                        ? localization.getTranslation("indefinite")
                        : DateTimeFormatHelper.secondsToDHMS(
                              timeoutRole.maxTime,
                              localization.language
                          )
                })`
            );
        }

        embed.setDescription(list.join("\n"));
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(allowedTimeoutRoles.size / 10),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Administrator"],
};
