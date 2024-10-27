import { DatabaseManager } from "@database/DatabaseManager";
import { ClanAuction } from "@database/utils/aliceDb/ClanAuction";
import { Clan } from "@database/utils/elainaDb/Clan";
import { AuctionBid } from "structures/clan/AuctionBid";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { GuildMember, EmbedBuilder, bold } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user,
        );

    const clanName: string = clan?.name ?? "";

    const auction: ClanAuction | null =
        await DatabaseManager.aliceDb.collections.clanAuction.getFromName(name);

    if (!auction) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("auctionDoesntExist"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    embed
        .setTitle(localization.getTranslation("auctionInfo"))
        .setDescription(
            `${bold(localization.getTranslation("auctionName"))}: ${
                auction.name
            }\n` +
                `${bold(localization.getTranslation("auctionAuctioneer"))}: ${
                    auction.auctioneer
                }\n` +
                `${bold(
                    localization.getTranslation("creationDate"),
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(auction.creationdate * 1000),
                    localization.language,
                )}\n` +
                `${bold(
                    localization.getTranslation("expirationDate"),
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(auction.expirydate * 1000),
                    localization.language,
                )}`,
        )
        .addFields({
            name: localization.getTranslation("auctionItem"),
            value:
                `${bold(
                    localization.getTranslation("auctionPowerup"),
                )}: ${StringHelper.capitalizeString(auction.powerup)}\n` +
                `${bold(
                    localization.getTranslation("auctionAmount"),
                )}: ${auction.amount.toLocaleString(BCP47)}\n` +
                `${bold(
                    localization.getTranslation("auctionMinimumBid"),
                )}: ${auction.min_price.toLocaleString(BCP47)} Mahiru coins`,
        });

    const bids: AuctionBid[] = [...auction.bids.values()];

    const bidIndex: number = bids.findIndex((b) => b.clan === clanName);

    let biddersDescription: string = "";

    for (let i = 0; i < 5; ++i) {
        const bid: AuctionBid = bids[i];

        if (bid) {
            biddersDescription += `#${i + 1}: ${bid.clan} - ${bold(
                bid.amount.toLocaleString(BCP47),
            )} Mahiru coins\n`;
        } else {
            biddersDescription += `#${i + 1}: -\n`;
        }
    }

    if (bidIndex > 4) {
        biddersDescription += ".\n".repeat(Math.min(bidIndex - 4, 3));
        biddersDescription += `#${bidIndex + 1}: ${clanName} - ${bold(
            bids[bidIndex].amount.toLocaleString(BCP47),
        )} Mahiru coins`;
    }

    embed.addFields({
        name: localization.getTranslation("auctionBidInfo"),
        value: biddersDescription,
    });

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
