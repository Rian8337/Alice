import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseClanAuction } from "@alice-interfaces/database/aliceDb/DatabaseClanAuction";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { GuildEmoji, MessageEmbed, TextChannel } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
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
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanAuctionNameIsTooLong
            ),
        });
    }

    if (!NumberHelper.isPositive(amount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.invalidClanAuctionAmount
            ),
        });
    }

    if (!NumberHelper.isPositive(minBidAmount)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.invalidClanAuctionMinimumBid
            ),
        });
    }

    if (!NumberHelper.isNumberInRange(duration, 60, 86400, true)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.invalidClanAuctionDuration
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

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
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
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanAuctionAmountOutOfBounds,
                (clan.powerups.get(powerup)?.amount ?? 0).toLocaleString()
            ),
        });
    }

    const auctionCheck: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (auctionCheck) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.auctionNameIsTaken
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.clanAuctionCreateConfirmation
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    clan.powerups.get(powerup)!.amount -= amount;

    const result: OperationResult = await clan.updateClan();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanAuctionCreateFailed,
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

    const coinEmoji: GuildEmoji = client.emojis.cache.get(
        Constants.aliceCoinEmote
    )!;

    const embed: MessageEmbed = EmbedCreator.createClanAuctionEmbed(
        newAuction,
        coinEmoji
    );

    embed.spliceFields(embed.fields.length - 1, 1);

    await notificationChannel.send({
        content: MessageCreator.createWarn(
            "An auction has started with the following details:"
        ),
        embeds: [embed],
    });

    interaction.editReply({
        content: MessageCreator.createReject(
            clanStrings.clanAuctionCreateSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
