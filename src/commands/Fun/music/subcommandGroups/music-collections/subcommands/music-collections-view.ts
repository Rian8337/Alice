import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            interaction.options.getString("name", true)
        );

    if (!collection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCollectionWithName")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(collection.name)
        .addField(
            localization.getTranslation("collectionOwner"),
            `<@${collection.owner}> (${collection.owner})`
        )
        .addField(
            localization.getTranslation("creationDate"),
            DateTimeFormatHelper.dateToLocaleString(
                new Date(collection.createdAt),
                localization.language
            )
        )
        .addField(
            localization.getTranslation("collectionLinks"),
            collection.videoIds.map((v, i) => `${i + 1}. ${v}`).join("\n")
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
