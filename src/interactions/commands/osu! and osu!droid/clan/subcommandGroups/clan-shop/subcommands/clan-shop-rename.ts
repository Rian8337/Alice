import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    if (name.length > 25) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameIsTooLong")
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
            ),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const powerReq: number = 500;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (clan.power < powerReq) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerNotEnoughToBuyItem"),
                powerReq.toLocaleString(BCP47)
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 2500;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoins"),
                StringHelper.formatString(
                    localization.getTranslation("buyShopItem"),
                    localization.getTranslation("clanRename")
                ),
                cost.toLocaleString(BCP47)
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("buyShopItemConfirmation"),
                localization.getTranslation("clanRename"),
                cost.toLocaleString(BCP47)
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    const coinDeductionResult: OperationResult =
        await playerInfo.incrementCoins(-cost, localization.language);

    if (!coinDeductionResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                coinDeductionResult.reason!
            ),
        });
    }

    const auctionRenameResult: OperationResult =
        await DatabaseManager.aliceDb.collections.clanAuction.updateOne(
            { auctioneer: clan.name },
            { $set: { auctioneer: name } }
        );

    if (!auctionRenameResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                auctionRenameResult.reason!
            ),
        });
    }

    const bindRenameResult: OperationResult =
        await DatabaseManager.elainaDb.collections.userBind.updateOne(
            { clan: clan.name },
            { $set: { clan: name } }
        );

    if (!bindRenameResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                bindRenameResult.reason!
            ),
        });
    }

    clan.name = name;

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                finalResult.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("buyShopItemSuccessful"),
            cost.toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
