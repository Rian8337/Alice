import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { musicStrings } from "@alice-commands/Fun/music/musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const queue: MusicQueue[] = musicInformation?.queue ?? [];

    if (queue.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.queueIsEmpty),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle("Current Queue");

    for (let i = 0; i < queue.length; ++i) {
        embed.addField(
            `${i + 1}. ${queue[i].information.title}`,
            `Queued/requested by <@${queue[i].queuer}>`
        );
    }

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
