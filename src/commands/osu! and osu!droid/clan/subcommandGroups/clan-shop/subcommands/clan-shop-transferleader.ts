import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const toTransfer: User = interaction.options.getUser("member", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    if (!clan.member_list.has(toTransfer.id)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.userIsNotInExecutorClan
            ),
        });
    }

    const powerReq: number = 300;

    if (clan.power < powerReq) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanPowerNotEnoughToBuyItem,
                powerReq.toLocaleString()
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 500;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "transfer leadership",
                cost.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.buyShopItemConfirmation,
                "leadership transfer",
                cost.toLocaleString()
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const coinDeductionResult: OperationResult =
        await playerInfo.incrementCoins(-cost);

    if (!coinDeductionResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed,
                coinDeductionResult.reason!
            ),
        });
    }

    const changeLeaderResult: OperationResult = await clan.changeLeader(
        toTransfer.id
    );

    if (!changeLeaderResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed,
                changeLeaderResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed,
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.buyShopItemSuccessful,
            cost.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
