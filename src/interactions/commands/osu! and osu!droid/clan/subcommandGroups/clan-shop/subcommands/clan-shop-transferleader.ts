import { DatabaseManager } from "@database/DatabaseManager";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { Clan } from "@database/utils/elainaDb/Clan";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { User } from "discord.js";
import { ClanLocalization } from "@localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        CommandHelper.getLocale(interaction),
    );

    const toTransfer: User = interaction.options.getUser("member", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user,
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan"),
            ),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    "selfHasNoAdministrativePermission",
                ),
            ),
        });
    }

    if (!clan.member_list.has(toTransfer.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsNotInExecutorClan"),
            ),
        });
    }

    const powerReq: number = 300;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (clan.power < powerReq) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerNotEnoughToBuyItem"),
                powerReq.toLocaleString(BCP47),
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    coins: 1,
                },
            },
        );

    const cost: number = 500;

    if (!playerInfo || playerInfo.coins < cost) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoins"),
                localization.getTranslation("leadershipTransfer"),
                cost.toLocaleString(BCP47),
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("buyShopItemConfirmation"),
                localization.getTranslation("leadershipTransfer"),
                cost.toLocaleString(BCP47),
            ),
        },
        [interaction.user.id],
        20,
        localization.language,
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
                coinDeductionResult.reason!,
            ),
        });
    }

    const changeLeaderResult: OperationResult = await clan.changeLeader(
        toTransfer.id,
    );

    if (!changeLeaderResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                changeLeaderResult.reason!,
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                finalResult.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("buyShopItemSuccessful"),
            cost.toLocaleString(BCP47),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
