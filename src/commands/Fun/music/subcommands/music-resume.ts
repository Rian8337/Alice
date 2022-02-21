import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { MusicLocalization } from "@alice-localization/commands/Fun/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: MusicLocalization = new MusicLocalization(language);

    const result: OperationResult = MusicManager.resume(
        (<GuildMember>interaction.member).voice.channel!,
        language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("resumeTrackFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(localization.getTranslation("resumeTrackSuccess")),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
