import { musicStrings } from "@alice-commands/Fun/music/musicStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildMember, MessageEmbed } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            interaction.options.getString("name", true)
        );

    if (!collection) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.noCollectionWithName
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(collection.name)
        .addField("Owner", `<@${collection.owner}> (${collection.owner})`)
        .addField("Creation Date", new Date(collection.createdAt).toUTCString())
        .addField(
            "Links",
            collection.videoIds.map((v, i) => `${i + 1}. v`).join("\n")
        );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
