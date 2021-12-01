import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

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

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 100;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "buy a clan powerup",
                cost.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.buyShopItemConfirmation,
                "clan powerup",
                cost.toLocaleString()
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    // Gacha style
    const gachaNum: number = Math.random() * 100;

    let powerup: PowerupType | undefined;

    switch (true) {
        case gachaNum <= 20: // 20% chance of not getting anything
            break;
        case gachaNum <= 50:
            powerup = "bomb"; // 30% chance
            break;
        case gachaNum <= 75:
            powerup = "challenge"; // 25% chance
            break;
        case gachaNum <= 82.5:
            powerup = "debuff"; // 7.5% chance
            break;
        case gachaNum <= 90:
            powerup = "buff"; // 7.5% chance
            break;
        case gachaNum <= 94:
            powerup = "superbomb"; // 4% chance
            break;
        case gachaNum <= 98:
            powerup = "superchallenge"; // 4% chance
            break;
        case gachaNum <= 99:
            powerup = "superdebuff"; // 1% chance
            break;
        case gachaNum <= 100:
            powerup = "superbuff"; // 1% chance
            break;
    }

    if (!powerup) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.powerupGachaNoResult
            ),
        });
    }

    ++clan.powerups.get(powerup)!.amount;

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: [
            MessageCreator.createAccept(clanStrings.powerupGachaWin, powerup),
            MessageCreator.createAccept(
                clanStrings.buyShopItemSuccessful,
                cost.toLocaleString()
            ),
        ].join("\n"),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
