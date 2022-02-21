import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { AuctionBid } from "@alice-interfaces/clan/AuctionBid";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(await CommandHelper.getLocale(interaction));

    const name: string = interaction.options.getString("name", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    const clanName: string = clan?.name ?? "";

    const auction: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (!auction) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("auctionDoesntExist")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(localization.getTranslation("auctionInfo"))
        .setDescription(
            `**${localization.getTranslation("auctionName")}**: ${auction.name}\n` +
            `**${localization.getTranslation("auctionAuctioneer")}**: ${auction.auctioneer}\n` +
            `**${localization.getTranslation("creationDate")}**: ${new Date(
                auction.creationdate * 1000
            ).toUTCString()}\n` +
            `**${localization.getTranslation("expirationDate")}**: ${new Date(
                auction.expirydate * 1000
            ).toUTCString()}`
        )
        .addField(
            localization.getTranslation("auctionItem"),
            `**${localization.getTranslation("auctionPowerup")}**: ${StringHelper.capitalizeString(auction.powerup)}\n` +
            `**${localization.getTranslation("auctionAmount")}**: ${auction.amount.toLocaleString()}\n` +
            `**${localization.getTranslation("auctionMinimumBid")}**: ${auction.min_price.toLocaleString()} Alice coins`
        );

    const bids: AuctionBid[] = [...auction.bids.values()];

    const bidIndex: number = bids.findIndex((b) => b.clan === clanName);

    let biddersDescription: string = "";

    for (let i = 0; i < 5; ++i) {
        const bid: AuctionBid = bids[i];

        if (bid) {
            biddersDescription += `#${i + 1}: ${bid.clan
                } - **${bid.amount.toLocaleString()}** Alice coins\n`;
        } else {
            biddersDescription += `#${i + 1}: -\n`;
        }
    }

    if (bidIndex > 4) {
        biddersDescription += ".\n".repeat(Math.min(bidIndex - 4, 3));
        biddersDescription += `#${bidIndex + 1}: ${clanName} - **${bids[
            bidIndex
        ].amount.toLocaleString()}** Alice coins`;
    }

    embed.addField(localization.getTranslation("auctionBidInfo"), biddersDescription);

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
