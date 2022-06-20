import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Collection, GuildMember, MessageEmbed } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const auctions: Collection<string, ClanAuction> =
        await DatabaseManager.aliceDb.collections.clanAuction.get("name");

    if (auctions.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noActiveAuctions")
            ),
        });
    }

    const page: number = NumberHelper.clamp(
        interaction.options.getInteger("page") ?? 1,
        1,
        Math.ceil(auctions.size / 5)
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(auctions.size, 5 + 5 * (page - 1));
            ++i
        ) {
            const auction: ClanAuction = auctions.at(i)!;

            embed.addField(
                `**${i + 1}. ${auction.name}**`,
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
                    )}\n\n` +
                    `**${localization.getTranslation(
                        "auctionPowerup"
                    )}**: ${StringHelper.capitalizeString(auction.powerup)}\n` +
                    `**${localization.getTranslation(
                        "auctionAmount"
                    )}**: ${auction.amount.toLocaleString(BCP47)}\n` +
                    `**${localization.getTranslation(
                        "auctionMinimumBid"
                    )}**: ${auction.min_price.toLocaleString(
                        BCP47
                    )} Alice coins\n` +
                    `**${localization.getTranslation(
                        "auctionBidders"
                    )}**: ${auction.bids.size.toLocaleString(BCP47)}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        page,
        Math.ceil(auctions.size / 5),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
