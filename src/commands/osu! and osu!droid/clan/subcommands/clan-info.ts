import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanCollectionManager } from "@alice-database/managers/elainaDb/ClanCollectionManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import {
    Canvas,
    createCanvas,
    Image,
    loadImage,
    NodeCanvasRenderingContext2D,
} from "canvas";
import {
    GuildEmoji,
    GuildMember,
    MessageAttachment,
    MessageEmbed,
    MessageOptions,
} from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const dbManager: ClanCollectionManager =
        DatabaseManager.elainaDb.collections.clan;

    const clan: Clan | null = interaction.options.getString("name")
        ? await dbManager.getFromName(
              interaction.options.getString("name", true)
          )
        : await dbManager.getFromUser(interaction.user);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                interaction.options.getString("name")
                    ? clanStrings.clanDoesntExist
                    : clanStrings.selfIsNotInClan
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color:
            (await clan.getClanRole())?.color ??
            (<GuildMember>interaction.member).displayColor,
    });

    const coinEmoji: GuildEmoji = client.emojis.cache.get(
        Constants.aliceCoinEmote
    )!;

    embed
        .setTitle(clan.name)
        .addField("Clan Leader", `<@${clan.leader}> (${clan.leader})`, true)
        .addField("Power", clan.power.toLocaleString(), true)
        .addField("Members", `${clan.member_list.size}/25`, true)
        .addField(
            "Creation Date",
            new Date(clan.createdAt * 1000).toUTCString(),
            true
        )
        .addField(
            "Total Upkeep Estimation",
            `${coinEmoji}${clan
                .calculateOverallUpkeep()
                .toLocaleString()} Alice coins`,
            true
        );

    if (clan.iconURL) {
        embed.setThumbnail(clan.iconURL);
    }

    if (clan.description) {
        embed.setDescription(clan.description);
    }

    const options: MessageOptions = {
        embeds: [embed],
    };

    if (clan.bannerURL) {
        const image: Image = await loadImage(clan.bannerURL);

        const canvas: Canvas = createCanvas(900, 250);

        const c: NodeCanvasRenderingContext2D = canvas.getContext("2d");

        c.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            900,
            250
        );

        const attachment: MessageAttachment = new MessageAttachment(
            canvas.toBuffer(),
            "banner.png"
        );

        embed.setImage("attachment://banner.png");

        options.files = [attachment];
    }

    interaction.editReply(options);
};

export const config: Subcommand["config"] = {
    permissions: [],
};
