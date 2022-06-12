import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const result: OperationResult = MusicManager.resume(
        (<GuildMember>interaction.member).voice.channel!,
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("resumeTrackFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("resumeTrackSuccess")
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
