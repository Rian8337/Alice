import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ClanCollectionManager } from "@alice-database/managers/elainaDb/ClanCollectionManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
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
    EmbedBuilder,
    MessageOptions,
    AttachmentBuilder,
} from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    interaction.options.getString("name")
                        ? "clanDoesntExist"
                        : "selfIsNotInClan"
                )
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color:
            (await clan.getClanRole())?.color ??
            (<GuildMember>interaction.member).displayColor,
    });

    const coinEmoji: GuildEmoji = client.emojis.cache.get(
        Constants.aliceCoinEmote
    )!;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    embed.setTitle(clan.name).addFields(
        {
            name: localization.getTranslation("clanLeader"),
            value: `<@${clan.leader}> (${clan.leader})`,
            inline: true,
        },
        {
            name: localization.getTranslation("clanPower"),
            value: clan.power.toLocaleString(BCP47),
            inline: true,
        },
        {
            name: localization.getTranslation("clanMemberCount"),
            value: `${clan.member_list.size}/25`,
            inline: true,
        },
        {
            name: localization.getTranslation("creationDate"),
            value: DateTimeFormatHelper.dateToLocaleString(
                new Date(clan.createdAt * 1000),
                localization.language
            ),
            inline: true,
        },
        {
            name: localization.getTranslation("clanTotalUpkeepEstimation"),
            value: `${coinEmoji}${clan
                .calculateOverallUpkeep()
                .toLocaleString(BCP47)} Alice coins`,
            inline: true,
        }
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

        const attachment: AttachmentBuilder = new AttachmentBuilder(
            canvas.toBuffer(),
            { name: "banner.png" }
        );

        embed.setImage("attachment://banner.png");

        options.files = [attachment];
    }

    InteractionHelper.reply(interaction, options);
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
