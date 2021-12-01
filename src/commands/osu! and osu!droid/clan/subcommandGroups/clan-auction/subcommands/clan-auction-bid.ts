import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const name: string = interaction.options.getString("name", true);

    const amount: number = interaction.options.getInteger("amount", true);

    const auction: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (!auction) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.auctionDoesntExist
            ),
        });
    }

    if (!NumberHelper.isPositive(amount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.invalidClanAuctionBidAmount
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    if (!playerInfo || playerInfo.alicecoins < amount) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "bid",
                amount.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.clanAuctionBidConfirmation
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    auction.bid(clan, amount);

    const coinDeductionResult: OperationResult =
        await playerInfo.incrementCoins(-amount);

    if (!coinDeductionResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanAuctionBidFailed,
                coinDeductionResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await auction.updateAuction();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanAuctionBidFailed,
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.clanAuctionBidSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
