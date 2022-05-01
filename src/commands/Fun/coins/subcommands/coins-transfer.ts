import { GuildMember, User } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CoinsLocalization } from "@alice-localization/commands/Fun/coins/CoinsLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: CoinsLocalization = new CoinsLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const toTransfer: User = interaction.options.getUser("user", true);

    const toTransferGuildMember: GuildMember | null = await interaction
        .guild!.members.fetch(toTransfer)
        .catch(() => null);

    if (!toTransferGuildMember) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferNotFound")
            ),
        });
    }

    if (toTransferGuildMember.user.bot) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferIsBot")
            ),
        });
    }

    if (toTransferGuildMember.id === interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferIsSelf")
            ),
        });
    }

    if (
        DateTimeFormatHelper.getTimeDifference(
            <Date>toTransferGuildMember.joinedAt
        ) >
        -86400 * 1000 * 7
    ) {
        return interaction.editReply(
            MessageCreator.createReject(
                localization.getTranslation("userToTransferNotInServerForAWeek")
            )
        );
    }

    const transferAmount: number = interaction.options.getInteger(
        "amount",
        true
    );

    if (!NumberHelper.isPositive(transferAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("transferAmountInvalid")
            ),
        });
    }

    const userPlayerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    if (!userPlayerInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntHaveCoinsInfo")
            ),
        });
    }

    if (
        !NumberHelper.isNumberInRange(
            transferAmount,
            0,
            userPlayerInfo.alicecoins
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoinsToTransfer")
            ),
        });
    }

    const toTransferPlayerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            toTransferGuildMember.id
        );

    if (!toTransferPlayerInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("otherUserDoesntHaveCoinsInfo")
            ),
        });
    }

    const player: Player = await Player.getInformation({
        uid: userPlayerInfo.uid,
    });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("cannotFetchPlayerInformation")
            ),
        });
    }

    let limit: number;

    switch (true) {
        case player.rank < 10:
            limit = 2500;
            break;
        case player.rank < 50:
            limit = 1750;
            break;
        case player.rank < 100:
            limit = 1250;
            break;
        case player.rank < 500:
            limit = 500;
            break;
        default:
            limit = 250;
    }

    const transferredAmount: number = userPlayerInfo.transferred;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("coinTransferConfirmation"),
                transferAmount.toLocaleString(BCP47),
                toTransferGuildMember.toString()
            ),
        },
        [interaction.user.id],
        15,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await userPlayerInfo.transferCoins(
        transferAmount,
        player,
        toTransferPlayerInfo,
        localization.language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("coinTransferFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("coinTransferSuccess"),
            transferAmount.toLocaleString(BCP47),
            toTransferGuildMember.toString(),
            (limit - transferAmount - transferredAmount).toLocaleString(BCP47),
            (userPlayerInfo.alicecoins - transferAmount).toLocaleString(BCP47)
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
