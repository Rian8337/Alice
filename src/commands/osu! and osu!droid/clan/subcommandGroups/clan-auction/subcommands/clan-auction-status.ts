import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { AuctionBid } from "@alice-interfaces/clan/AuctionBid";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
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
                clanStrings.auctionDoesntExist
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle("Auction Information")
        .setDescription(
            `**Name**: ${auction.name}\n` +
                `**Auctioneer**: ${auction.auctioneer}\n` +
                `**Creation Date**: ${new Date(
                    auction.creationdate * 1000
                ).toUTCString()}\n` +
                `**Expiration Date**: ${new Date(
                    auction.expirydate * 1000
                ).toUTCString()}`
        )
        .addField(
            "Auction Item",
            `**Powerup**: ${StringHelper.capitalizeString(auction.powerup)}\n` +
                `**Amount**: ${auction.amount.toLocaleString()}\n` +
                `**Minimum Bid Amount**: ${auction.min_price.toLocaleString()} Alice coins`
        );

    const bids: AuctionBid[] = [...auction.bids.values()];

    const bidIndex: number = bids.findIndex((b) => b.clan === clanName);

    let biddersDescription: string = "";

    for (let i = 0; i < 5; ++i) {
        const bid: AuctionBid = bids[i];

        if (bid) {
            biddersDescription += `#${i + 1}: ${
                bid.clan
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

    embed.addField("Bid Information", biddersDescription);

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
