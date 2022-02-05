import { DatabaseManager } from "@alice-database/DatabaseManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { RoleTimeoutPermission } from "@alice-interfaces/moderation/RoleTimeoutPermission";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { Collection, MessageEmbed } from "discord.js";
import { settingsStrings } from "../../../settingsStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            interaction.guildId
        );

    if (!guildConfig) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                settingsStrings.noLogChannelConfigured
            ),
        });
    }

    const allowedTimeoutRoles: Collection<string, RoleTimeoutPermission> =
        guildConfig.allowedTimeoutRoles;

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed.setTitle("Roles with Timeout Permission");

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: RoleTimeoutPermission[]
    ) => {
        embed.setDescription(
            contents
                .slice(10 * (page - 1), 10 + 10 * (page - 1))
                .map(
                    (v) =>
                        `- <@&${v.id}> (${
                            v.maxTime === -1
                                ? "Indefinite"
                                : DateTimeFormatHelper.secondsToDHMS(v.maxTime)
                        })`
                )
                .join("\n")
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...allowedTimeoutRoles.values()],
        10,
        1,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: ["ADMINISTRATOR"],
};
