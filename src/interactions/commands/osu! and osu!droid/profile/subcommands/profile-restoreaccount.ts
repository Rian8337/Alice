import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { bold, GuildMember } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new ProfileLocalization(
        CommandHelper.getLocale(interaction),
    );

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    if (!NumberHelper.isNumberInRange(bindInfo.uid, 405907, 430370, true)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerCredentialsNotFound"),
            ),
        });
    }

    const credential =
        await DatabaseManager.aliceDb.collections.restoredPlayerCredentials.getOne(
            { Id: bindInfo.uid },
            {
                projection: {
                    _id: 0,
                    Username: 1,
                    Password: 1,
                },
            },
        );

    if (!credential) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerCredentialsNotFound"),
            ),
        });
    }

    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .setTitle(localization.getTranslation("playerCredentialsInfo"))
        .setDescription(
            `${bold(
                localization.getTranslation("doNotShareCredentialsWarning"),
            )}\n\n` +
                StringHelper.formatString(
                    localization.getTranslation("changeCredentialsDirection"),
                    "https://osudroid.moe/user?action=login",
                ) +
                "\n\n" +
                `${bold(localization.getTranslation("username"))}: \`${
                    credential.Username
                }\`\n` +
                `${bold(localization.getTranslation("password"))}: \`${
                    credential.Password
                }\``,
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    replyEphemeral: true,
};
