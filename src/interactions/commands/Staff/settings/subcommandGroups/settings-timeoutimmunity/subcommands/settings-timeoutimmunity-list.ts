import { DatabaseManager } from "@database/DatabaseManager";
import { GuildPunishmentConfig } from "@database/utils/aliceDb/GuildPunishmentConfig";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { SettingsLocalization } from "@localization/interactions/commands/Staff/settings/SettingsLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { EmbedBuilder, roleMention, Snowflake } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: SettingsLocalization = new SettingsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId,
        );

    if (!guildConfig) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noLogChannelConfigured"),
            ),
        });
    }

    const immuneTimeoutRoles: Snowflake[] = guildConfig.immuneTimeoutRoles;

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed.setTitle(localization.getTranslation("rolesWithTimeoutImmunity"));

    const onPageChange: OnButtonPageChange = async (_, page) => {
        embed.setDescription(
            immuneTimeoutRoles
                .slice(10 * (page - 1), 10 + 10 * (page - 1))
                .map((v) => `- ${roleMention(v)}`)
                .join("\n"),
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(immuneTimeoutRoles.length / 10),
        120,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Administrator"],
};
