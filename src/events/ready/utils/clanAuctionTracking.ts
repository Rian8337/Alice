import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, GuildEmoji, MessageEmbed, TextChannel } from "discord.js";
import { ClanAuction } from "@alice-database/utils/aliceDb/ClanAuction";
import { AuctionBid } from "@alice-interfaces/clan/AuctionBid";
import { Config } from "@alice-core/Config";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: EventUtil["run"] = async (client) => {
    const coinEmoji: GuildEmoji = client.emojis.cache.get(
        Constants.aliceCoinEmote
    )!;
    const notificationChannel: TextChannel = <TextChannel>(
        await client.channels.fetch("696646867567640586")
    );

    setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("clanAuctionTracking")
        ) {
            return;
        }

        const executionTime: number = Math.floor(Date.now() / 1000);

        const expiredAuctions: Collection<string, ClanAuction> =
            await DatabaseManager.aliceDb.collections.clanAuction.getExpiredAuctions(
                executionTime
            );

        for await (const expiredAuction of expiredAuctions.values()) {
            const embed: MessageEmbed = EmbedCreator.createClanAuctionEmbed(
                expiredAuction,
                coinEmoji
            );

            if (expiredAuction.bids.size === 0) {
                embed.addField("Winner", "None");
                await expiredAuction.returnItemToAuctioneer();
                return notificationChannel.send({
                    content: MessageCreator.createWarn(
                        `${expiredAuction.auctioneer}'s \`${expiredAuction.name}\` expiredAuction has ended! There are no bids put!`
                    ),
                    embeds: [embed],
                });
            }

            const winnerClan: Clan | null =
                await expiredAuction.getWinnerClan();

            if (!winnerClan) {
                embed.addField("Winner", "None");
                await expiredAuction.returnItemToAuctioneer();
                return notificationChannel.send({
                    content: MessageCreator.createWarn(
                        `${expiredAuction.auctioneer}'s \`${expiredAuction.name}\` expiredAuction has ended! There are bids put, however all bidders were disbanded!`
                    ),
                    embeds: [embed],
                });
            }

            await expiredAuction.giveItemTo(winnerClan);
            await expiredAuction.end(true);

            const bidArray: AuctionBid[] = [...expiredAuction.bids.values()];

            const bidIndex: number = bidArray.findIndex(
                (v) => v.clan === winnerClan.name
            );

            embed.addField(
                "Winner",
                `${winnerClan.name} - \`${bidArray[bidIndex].amount}\` Alice coins`
            );

            await notificationChannel.send({
                content: MessageCreator.createWarn(
                    `${expiredAuction.auctioneer}'s \`${
                        expiredAuction.name
                    }\` expiredAuction has ended! ${
                        bidIndex > 0
                            ? `Unfortunately, the top ${bidIndex} bidder(s) were not available or disbanded. `
                            : ""
                    }\`${winnerClan.name}\` wins the expiredAuction!`
                ),
                embeds: [embed],
            });
        }
    }, 60 * 10 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for tracking clan auctions.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
