import { DatabaseManager } from "@database/DatabaseManager";
import { MusicCollection } from "@database/utils/aliceDb/MusicCollection";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@localization/interactions/commands/Fun/music/MusicLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { GuildMember, EmbedBuilder, userMention } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            interaction.options.getString("name", true),
        );

    if (!collection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCollectionWithName"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(collection.name).addFields(
        {
            name: localization.getTranslation("collectionOwner"),
            value: `${userMention(collection.owner)} (${collection.owner})`,
        },
        {
            name: localization.getTranslation("creationDate"),
            value: DateTimeFormatHelper.dateToLocaleString(
                new Date(collection.createdAt),
                localization.language,
            ),
        },
        {
            name: localization.getTranslation("collectionLinks"),
            value: collection.videoIds
                .map((v, i) => `${i + 1}. ${v}`)
                .join("\n"),
        },
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
