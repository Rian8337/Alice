import { readFile } from "fs/promises";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageAttachment } from "discord.js";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { UserbindLocalization } from "@alice-localization/commands/osu! and osu!droid/userbind/UserbindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const data: Buffer = await readFile(
        `${process.cwd()}/files/LiSA - crossing field (osu!droid bind verification).osz`
    );

    const attachment: MessageAttachment = new MessageAttachment(
        data,
        "LiSA - crossing field (osu!droid bind verification).osz"
    );

    return interaction.editReply({
        content: MessageCreator.createWarn(
            new UserbindLocalization(
                await CommandHelper.getLocale(interaction)
            ).getTranslation("verificationMapInformation")
        ),
        files: [attachment],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
