import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const name: string = interaction.options.getString("name", true);

    if (name.length > 25) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("clanNameIsTooLong")),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("selfIsNotInClan")),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const powerReq: number = 500;

    if (clan.power < powerReq) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerNotEnoughToBuyItem"),
                powerReq.toLocaleString()
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 2500;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoins"),
                StringHelper.formatString(
                    localization.getTranslation("buyShopItem"),
                    localization.getTranslation("clanRename")
                ),
                cost.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("buyShopItemConfirmation"),
                localization.getTranslation("clanRename"),
                cost.toLocaleString()
            ),
        },
        [interaction.user.id],
        20,
        language
    );

    if (!confirmation) {
        return;
    }

    const coinDeductionResult: OperationResult =
        await playerInfo.incrementCoins(-cost, language);

    if (!coinDeductionResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                coinDeductionResult.reason!
            ),
        });
    }

    const auctionRenameResult: OperationResult =
        await DatabaseManager.aliceDb.collections.clanAuction.update(
            { auctioneer: clan.name },
            { $set: { auctioneer: name } }
        );

    if (!auctionRenameResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                auctionRenameResult.reason!
            ),
        });
    }

    const bindRenameResult: OperationResult =
        await DatabaseManager.elainaDb.collections.userBind.update(
            { clan: clan.name },
            { $set: { clan: name } }
        );

    if (!bindRenameResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                bindRenameResult.reason!
            ),
        });
    }

    clan.name = name;

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                finalResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("buyShopItemSuccessful"),
            cost.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
