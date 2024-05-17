import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Birthday } from "@alice-database/utils/aliceDb/Birthday";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { BirthdayLocalization } from "@alice-localization/interactions/commands/Fun/birthday/BirthdayLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember, EmbedBuilder, User, underscore, bold } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: BirthdayLocalization = new BirthdayLocalization(
        CommandHelper.getLocale(interaction),
    );

    const user: User = interaction.options.getUser("user") ?? interaction.user;

    const birthday: Birthday | null =
        await DatabaseManager.aliceDb.collections.birthday.getUserBirthday(
            user.id,
        );

    if (!birthday) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    user.id === interaction.user.id
                        ? "selfBirthdayNotExist"
                        : "userBirthdayNotExist",
                ),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.setDescription(
        `${underscore(
            bold(
                StringHelper.formatString(
                    localization.getTranslation("birthdayInfo"),
                    user.toString(),
                ),
            ),
        )}\n` +
            `${bold(localization.getTranslation("date"))}: ${birthday.date}/${
                birthday.month + 1
            }\n` +
            `${bold(localization.getTranslation("timezone"))}: UTC${
                birthday.timezone >= 0
                    ? `+${birthday.timezone}`
                    : birthday.timezone
            }`,
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
