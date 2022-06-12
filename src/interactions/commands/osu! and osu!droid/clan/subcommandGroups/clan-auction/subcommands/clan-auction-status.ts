import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { AuctionBid } from "@alice-interfaces/clan/AuctionBid";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    const clanName: string = clan?.name ?? "";

    const auction: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (!auction) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("auctionDoesntExist")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    embed
        .setTitle(localization.getTranslation("auctionInfo"))
        .setDescription(
            `**${localization.getTranslation("auctionName")}**: ${
                auction.name
            }\n` +
                `**${localization.getTranslation("auctionAuctioneer")}**: ${
                    auction.auctioneer
                }\n` +
                `**${localization.getTranslation(
                    "creationDate"
                )}**: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(auction.creationdate * 1000),
                    localization.language
                )}\n` +
                `**${localization.getTranslation(
                    "expirationDate"
                )}**: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(auction.expirydate * 1000),
                    localization.language
                )}`
        )
        .addField(
            localization.getTranslation("auctionItem"),
            `**${localization.getTranslation(
                "auctionPowerup"
            )}**: ${StringHelper.capitalizeString(auction.powerup)}\n` +
                `**${localization.getTranslation(
                    "auctionAmount"
                )}**: ${auction.amount.toLocaleString(BCP47)}\n` +
                `**${localization.getTranslation(
                    "auctionMinimumBid"
                )}**: ${auction.min_price.toLocaleString(BCP47)} Alice coins`
        );

    const bids: AuctionBid[] = [...auction.bids.values()];

    const bidIndex: number = bids.findIndex((b) => b.clan === clanName);

    let biddersDescription: string = "";

    for (let i = 0; i < 5; ++i) {
        const bid: AuctionBid = bids[i];

        if (bid) {
            biddersDescription += `#${i + 1}: ${
                bid.clan
            } - **${bid.amount.toLocaleString(BCP47)}** Alice coins\n`;
        } else {
            biddersDescription += `#${i + 1}: -\n`;
        }
    }

    if (bidIndex > 4) {
        biddersDescription += ".\n".repeat(Math.min(bidIndex - 4, 3));
        biddersDescription += `#${bidIndex + 1}: ${clanName} - **${bids[
            bidIndex
        ].amount.toLocaleString(BCP47)}** Alice coins`;
    }

    embed.addField(
        localization.getTranslation("auctionBidInfo"),
        biddersDescription
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
