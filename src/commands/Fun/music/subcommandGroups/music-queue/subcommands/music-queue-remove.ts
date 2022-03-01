import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: MusicLocalization = new MusicLocalization(language);

    const queue: MusicQueue[] = MusicManager.musicInformations.get(
        (<GuildMember>interaction.member).voice.channelId!
    )!.queue;

    const position: number = NumberHelper.clamp(
        interaction.options.getInteger("position") ?? 1,
        1,
        queue.length
    );

    const title: string | undefined = queue[position - 1]?.information.title;

    const result: OperationResult = MusicManager.dequeue(
        (<GuildMember>interaction.member).voice.channel!,
        position,
        language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("removeQueueFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("removeQueueSuccess"),
            title
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
