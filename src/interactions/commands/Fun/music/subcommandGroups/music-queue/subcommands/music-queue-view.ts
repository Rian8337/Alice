import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicInfo } from "@utils/music/MusicInfo";
import { MusicQueue } from "@utils/music/MusicQueue";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MusicManager } from "@utils/managers/MusicManager";
import { GuildMember, EmbedBuilder, userMention } from "discord.js";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MusicLocalization } from "@localization/interactions/commands/Fun/music/MusicLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const queue: MusicQueue[] = musicInformation?.queue ?? [];

    if (queue.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("queueIsEmpty"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(localization.getTranslation("currentQueue"));

    for (let i = 0; i < queue.length; ++i) {
        embed.addFields({
            name: `${i + 1}. ${queue[i].information.title}`,
            value: StringHelper.formatString(
                localization.getTranslation("requestedBy"),
                userMention(queue[i].queuer),
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
