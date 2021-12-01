import { GuildMember, User } from "discord.js";
import { Player } from "osu-droid";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { coinsStrings } from "../coinsStrings";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

export const run: Subcommand["run"] = async (client, interaction) => {
    const toTransfer: User = interaction.options.getUser("user", true);

    const toTransferGuildMember: GuildMember | null = await interaction
        .guild!.members.fetch(toTransfer)
        .catch(() => null);

    if (!toTransferGuildMember) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.userToTransferNotFound
            ),
        });
    }

    if (toTransferGuildMember.user.bot) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.userToTransferIsBot
            ),
        });
    }

    if (toTransferGuildMember.id === interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.userToTransferIsSelf
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
                coinsStrings.userToTransferNotInServerForAWeek
            )
        );
    }

    const transferAmount: number = <number>(
        interaction.options.getInteger("amount")
    );

    if (!NumberHelper.isPositive(transferAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.transferAmountInvalid
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
                coinsStrings.userDoesntHaveCoinsInfo
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
                coinsStrings.notEnoughCoinsToTransfer
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
                coinsStrings.otherUserDoesntHaveCoinsInfo
            ),
        });
    }

    const player: Player = await Player.getInformation({
        uid: userPlayerInfo.uid,
    });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.cannotFetchPlayerInformation
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

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                coinsStrings.coinTransferConfirmation,
                transferAmount.toLocaleString(),
                toTransferGuildMember.toString()
            ),
        },
        [interaction.user.id],
        15
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await userPlayerInfo.transferCoins(
        transferAmount,
        player,
        toTransferPlayerInfo
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                coinsStrings.coinTransferFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            coinsStrings.coinTransferSuccess,
            transferAmount.toLocaleString(),
            toTransferGuildMember.toString(),
            (limit - transferAmount - transferredAmount).toLocaleString(),
            (userPlayerInfo.alicecoins - transferAmount).toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
