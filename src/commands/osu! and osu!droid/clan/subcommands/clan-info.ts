import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanCollectionManager } from "@alice-database/managers/elainaDb/ClanCollectionManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import {
    Canvas,
    createCanvas,
    Image,
    loadImage,
    CanvasRenderingContext2D,
} from "canvas";
import {
    GuildEmoji,
    GuildMember,
    MessageAttachment,
    MessageEmbed,
    MessageOptions,
} from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

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
                localization.getTranslation(
                    interaction.options.getString("name")
                        ? "clanDoesntExist"
                        : "selfIsNotInClan"
                )
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
        .addField(
            localization.getTranslation("clanLeader"),
            `<@${clan.leader}> (${clan.leader})`,
            true
        )
        .addField(
            localization.getTranslation("clanPower"),
            clan.power.toLocaleString(),
            true
        )
        .addField(
            localization.getTranslation("clanMemberCount"),
            `${clan.member_list.size}/25`,
            true
        )
        .addField(
            localization.getTranslation("creationDate"),
            DateTimeFormatHelper.dateToLocaleString(
                new Date(clan.createdAt * 1000),
                localization.language
            ),
            true
        )
        .addField(
            localization.getTranslation("clanTotalUpkeepEstimation"),
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

        const c: CanvasRenderingContext2D = canvas.getContext("2d");

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
