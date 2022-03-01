import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const queue: MusicQueue[] = musicInformation?.queue ?? [];

    if (queue.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("queueIsEmpty")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(localization.getTranslation("currentQueue"));

    for (let i = 0; i < queue.length; ++i) {
        embed.addField(
            `${i + 1}. ${queue[i].information.title}`,
            StringHelper.formatString(
                localization.getTranslation("requestedBy"),
                `<@${queue[i].queuer}>`
            )
        );
    }

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
