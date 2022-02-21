import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Birthday } from "@alice-database/utils/aliceDb/Birthday";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { BirthdayLocalization } from "@alice-localization/commands/Fun/BirthdayLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember, MessageEmbed, User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: BirthdayLocalization = new BirthdayLocalization(await CommandHelper.getLocale(interaction));

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const birthday: Birthday | null =
        await DatabaseManager.aliceDb.collections.birthday.getUserBirthday(
            user.id
        );

    if (!birthday) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation(user.id === interaction.user.id ? "selfBirthdayNotExist" : "userBirthdayNotExist")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    // TODO: replace
    embed.setDescription(
        `__**Birthday Info for ${user}**__\n` +
        `**Date**: ${birthday.date}/${birthday.month + 1}\n` +
        `**Timezone**: UTC${birthday.timezone >= 0
            ? `+${birthday.timezone}`
            : birthday.timezone
        }`
    );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
