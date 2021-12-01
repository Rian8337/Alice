import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";
import { musicStrings } from "../../../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
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
        position
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.removeQueueFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.removeQueueSuccess,
            title
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
