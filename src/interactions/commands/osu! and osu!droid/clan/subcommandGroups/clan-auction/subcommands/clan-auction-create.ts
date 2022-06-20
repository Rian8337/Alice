import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { DatabaseClanAuction } from "@alice-interfaces/database/aliceDb/DatabaseClanAuction";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { GuildEmoji, MessageEmbed, TextChannel } from "discord.js";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const powerup: PowerupType = <PowerupType>(
        interaction.options.getString("powerup", true)
    );

    const amount: number = interaction.options.getInteger("amount", true);

    const minBidAmount: number = interaction.options.getInteger(
        "minimumbidamount",
        true
    );

    const duration: number = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("duration", true)
    );

    if (name.length > 20) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanAuctionNameIsTooLong")
            ),
        });
    }

    if (!NumberHelper.isPositive(amount)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidClanAuctionAmount")
            ),
        });
    }

    if (!NumberHelper.isPositive(minBidAmount)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidClanAuctionMinimumBid")
            ),
        });
    }

    if (!NumberHelper.isNumberInRange(duration, 60, 86400, true)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidClanAuctionDuration")
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

    if (!clan.hasAdministrativePower(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    if (
        !NumberHelper.isNumberInRange(
            amount,
            1,
            clan.powerups.get(powerup)?.amount ?? 0,
            true
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanAuctionAmountOutOfBounds"),
                (clan.powerups.get(powerup)?.amount ?? 0).toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )
            ),
        });
    }

    const auctionCheck: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (auctionCheck) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("auctionNameIsTaken")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("clanAuctionCreateConfirmation")
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    clan.powerups.get(powerup)!.amount -= amount;

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanAuctionCreateFailed"),
                result.reason!
            ),
        });
    }

    const notificationChannel: TextChannel = <TextChannel>(
        await client.channels.fetch("696646867567640586")
    );

    const partialData: Partial<DatabaseClanAuction> = {
        amount: amount,
        auctioneer: clan.name,
        min_price: minBidAmount,
        name: name,
        powerup: powerup,
        expirydate: Math.floor(Date.now() / 1000) + duration,
    };

    const newAuction: ClanAuction = Object.assign(
        DatabaseManager.aliceDb.collections.clanAuction.defaultInstance,
        partialData
    );

    await DatabaseManager.aliceDb.collections.clanAuction.insert(partialData);

    const coinEmoji: GuildEmoji = client.emojis.cache.get(
        Constants.aliceCoinEmote
    )!;

    const embed: MessageEmbed = EmbedCreator.createClanAuctionEmbed(
        newAuction,
        coinEmoji,
        localization.language
    );

    embed.spliceFields(embed.fields.length - 1, 1);

    await notificationChannel.send({
        content: MessageCreator.createWarn(
            "An auction has started with the following details:"
        ),
        embeds: [embed],
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createReject(
            localization.getTranslation("clanAuctionCreateSuccessful")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
