import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Role } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (clan.roleIconUnlocked) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.shopItemIsUnlocked
            ),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const powerReq: number = 3500;

    if (clan.power < powerReq) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanPowerNotEnoughToBuyItem,
                powerReq.toLocaleString()
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanDoesntHaveClanRole
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 25000;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "buy a clan role icon unlock ability",
                cost.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.buyShopItemConfirmation,
                "clan role icon unlock ability",
                cost.toLocaleString()
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const firstResult: OperationResult = await playerInfo.incrementCoins(-cost);

    if (!firstResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed,
                firstResult.reason!
            ),
        });
    }

    clan.roleIconUnlocked = true;

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
