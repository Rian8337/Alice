import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Birthday } from "@alice-database/utils/aliceDb/Birthday";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildMember, MessageEmbed, User } from "discord.js";
import { birthdayStrings } from "../birthdayStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const birthday: Birthday | null =
        await DatabaseManager.aliceDb.collections.birthday.getUserBirthday(
            user.id
        );

    if (!birthday) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                birthdayStrings.birthdayNotExist,
                user.id === interaction.user.id
                    ? "you don't"
                    : "the user doesn't"
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.setDescription(
        `__**Birthday Info for ${user}**__\n` +
            `**Date**: ${birthday.date}/${birthday.month + 1}\n` +
            `**Timezone**: UTC${
                birthday.timezone >= 0
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
