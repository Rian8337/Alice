import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { RestoredPlayerCredentials } from "@alice-database/utils/aliceDb/RestoredPlayerCredentials";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { bold, Collection, EmbedBuilder, GuildMember } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    previous_bind: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    const retrievedUids: number[] = bindInfo.previous_bind.filter((v) =>
        NumberHelper.isNumberInRange(v, 405907, 430370, true)
    );

    if (retrievedUids.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerCredentialsNotFound")
            ),
        });
    }

    const playerCredentials: Collection<number, RestoredPlayerCredentials> =
        await DatabaseManager.aliceDb.collections.restoredPlayerCredentials.get(
            "Id",
            {
                Id: {
                    $in: retrievedUids,
                },
            },
            {
                projection: {
                    _id: 0,
                    Username: 1,
                    Password: 1,
                },
            }
        );

    if (playerCredentials.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playerCredentialsNotFound")
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .setTitle(localization.getTranslation("playerCredentialsInfo"))
        .setDescription(
            `${bold(
                localization.getTranslation("doNotShareCredentialsWarning")
            )}\n\n` +
                StringHelper.formatString(
                    localization.getTranslation("changeCredentialsDirection"),
                    "https://osudroid.moe/user?action=login"
                )
        );

    let i: number = 1;

    for (const credential of playerCredentials.values()) {
        embed.addFields({
            name: i.toString(),
            value:
                `${bold(localization.getTranslation("username"))}: \`${
                    credential.Username
                }\`\n` +
                `${bold(localization.getTranslation("password"))}: \`${
                    credential.Password
                }\``,
        });

        ++i;
    }

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
