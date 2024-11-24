import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { CoinsLocalization } from "@localization/interactions/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { DroidHelper } from "@utils/helpers/DroidHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new CoinsLocalization(
        CommandHelper.getLocale(interaction),
    );

    const toTransfer = interaction.options.getUser("user", true);

    const toTransferGuildMember = await interaction.guild.members
        .fetch(toTransfer)
        .catch(() => null);

    if (!toTransferGuildMember) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferNotFound"),
            ),
        });
    }

    if (toTransferGuildMember.user.bot) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferIsBot"),
            ),
        });
    }

    if (toTransferGuildMember.id === interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferIsSelf"),
            ),
        });
    }

    if (
        DateTimeFormatHelper.getTimeDifference(
            <Date>toTransferGuildMember.joinedAt,
        ) >
        -86400 * 1000 * 7
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    "userToTransferNotInServerForAWeek",
                ),
            ),
        });
    }

    const transferAmount = interaction.options.getInteger("amount", true);

    if (!NumberHelper.isPositive(transferAmount)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("transferAmountInvalid"),
            ),
        });
    }

    const userPlayerInfo =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    coins: 1,
                    transferred: 1,
                },
            },
        );

    if (!userPlayerInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntHaveCoinsInfo"),
            ),
        });
    }

    if (
        !NumberHelper.isNumberInRange(transferAmount, 0, userPlayerInfo.coins)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoinsToTransfer"),
            ),
        });
    }

    const toTransferPlayerInfo =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            toTransferGuildMember.id,
            {
                projection: {
                    _id: 0,
                    coins: 1,
                },
            },
        );

    if (!toTransferPlayerInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("otherUserDoesntHaveCoinsInfo"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(userPlayerInfo.uid, ["id"]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("cannotFetchPlayerInformation"),
            ),
        });
    }

    const rank =
        player instanceof Player
            ? player.rank
            : ((await DroidHelper.getPlayerPPRank(player.id)) ?? 0);

    let limit: number;

    switch (true) {
        case rank < 10:
            limit = 2500;
            break;
        case rank < 50:
            limit = 1750;
            break;
        case rank < 100:
            limit = 1250;
            break;
        case rank < 500:
            limit = 500;
            break;
        default:
            limit = 250;
    }

    const transferredAmount = userPlayerInfo.transferred;
    const BCP47 = LocaleHelper.convertToBCP47(localization.language);

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("coinTransferConfirmation"),
                transferAmount.toLocaleString(BCP47),
                toTransferGuildMember.toString(),
            ),
        },
        [interaction.user.id],
        15,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    const result = await userPlayerInfo.transferCoins(
        transferAmount,
        player,
        toTransferPlayerInfo,
        limit,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("coinTransferFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("coinTransferSuccess"),
            transferAmount.toLocaleString(BCP47),
            toTransferGuildMember.toString(),
            (limit - transferAmount - transferredAmount).toLocaleString(BCP47),
            (userPlayerInfo.coins - transferAmount).toLocaleString(BCP47),
        ),
    });
};
