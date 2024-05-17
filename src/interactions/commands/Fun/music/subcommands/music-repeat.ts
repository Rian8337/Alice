import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const repeatMode: boolean = interaction.options.getBoolean("repeat", true);

    const result: OperationResult = MusicManager.setRepeat(
        (<GuildMember>interaction.member).voice.channel!,
        repeatMode,
        localization.language,
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("repeatModeFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation(
                repeatMode
                    ? "repeatModeEnableSuccess"
                    : "repeatModeDisableSuccess",
            ),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
