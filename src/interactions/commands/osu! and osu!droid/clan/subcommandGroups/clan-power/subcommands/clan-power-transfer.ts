import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Symbols } from "@alice-enums/utils/Symbols";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { PowerupType } from "structures/clan/PowerupType";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const from: User = interaction.options.getUser("fromclan", true);

    const to: User = interaction.options.getUser("toclan", true);

    const isChallengePassed: boolean = interaction.options.getBoolean(
        "challengepassed",
        true
    );

    const fromClan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(from);

    if (!fromClan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferFromNotInClan")
            ),
        });
    }

    if (!fromClan.isMatch) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanToTransferFromNotInMatchMode")
            ),
        });
    }

    const toClan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(to);

    if (!toClan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userToTransferToNotInClan")
            ),
        });
    }

    if (!toClan.isMatch) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanToTransferToNotInMatchMode")
            ),
        });
    }

    const allResponses: string[] = [];

    let finalMultiplier: number = 0.1;

    const debuffPowerups: PowerupType[] = [
        "megadebuff",
        "superdebuff",
        "debuff",
        "megabomb",
        "superbomb",
        "bomb",
    ];

    const buffPowerups: PowerupType[] = [
        "megabuff",
        "superbuff",
        "buff",
        "megachallenge",
        "superchallenge",
        "challenge",
    ];

    for (const powerup of fromClan.active_powerups) {
        if (!debuffPowerups.includes(powerup)) {
            continue;
        }

        allResponses.push(
            MessageCreator.createPrefixedMessage(
                localization.getTranslation("clanHasPowerupActive"),
                Symbols.downArrow,
                fromClan.name,
                powerup
            )
        );

        switch (powerup) {
            case "megadebuff":
                finalMultiplier /= 1.8;
                break;
            case "superdebuff":
                finalMultiplier /= 1.5;
                break;
            case "debuff":
                finalMultiplier /= 1.1;
                break;
        }

        if (!isChallengePassed) {
            switch (powerup) {
                case "megabomb":
                    finalMultiplier /= 1.7;
                    break;
                case "superbomb":
                    finalMultiplier /= 1.3;
                    break;
                case "bomb":
                    finalMultiplier /= 1.05;
                    break;
            }
        }
    }

    for (const powerup of toClan.active_powerups) {
        if (!buffPowerups.includes(powerup)) {
            continue;
        }

        allResponses.push(
            MessageCreator.createPrefixedMessage(
                localization.getTranslation("clanHasPowerupActive"),
                Symbols.upArrow,
                toClan.name,
                powerup
            )
        );

        switch (powerup) {
            case "megabuff":
                finalMultiplier *= 2;
                break;
            case "superbuff":
                finalMultiplier *= 1.6;
                break;
            case "buff":
                finalMultiplier *= 1.2;
                break;
        }

        if (isChallengePassed) {
            switch (powerup) {
                case "megachallenge":
                    finalMultiplier *= 1.7;
                    break;
                case "superchallenge":
                    finalMultiplier *= 1.3;
                    break;
                case "challenge":
                    finalMultiplier *= 1.05;
                    break;
            }
        }
    }

    const totalGivenPower: number = Math.min(
        fromClan.power,
        Math.floor(fromClan.power * finalMultiplier)
    );

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("clanPowerTransferConfirmation"),
                totalGivenPower.toLocaleString(BCP47),
                fromClan.name,
                toClan.name
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    const currentTime: number = Math.floor(Date.now() / 1000);

    fromClan.isMatch = false;
    fromClan.active_powerups = [];
    fromClan.member_list.get(from.id)!.battle_cooldown =
        currentTime + 86400 * 4;
    fromClan.power -= totalGivenPower;

    toClan.isMatch = false;
    toClan.active_powerups = [];
    toClan.member_list.get(to.id)!.battle_cooldown = currentTime + 86400 * 4;
    toClan.power += totalGivenPower;

    const fromClanResult: OperationResult = await fromClan.updateClan();

    if (!fromClanResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerTransferFailed"),
                fromClanResult.reason!
            ),
        });
    }

    const toClanResult: OperationResult = await toClan.updateClan();

    if (!toClanResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerTransferFailed"),
                toClanResult.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("clanPowerTransferSuccessful"),
            totalGivenPower.toLocaleString(BCP47),
            fromClan.name,
            toClan.name
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
