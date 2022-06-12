import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

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
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("removeQueueFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("removeQueueSuccess"),
            title
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
