import { readFile } from "fs/promises";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageAttachment } from "discord.js";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { userbindStrings } from "../userbindStrings";

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
            userbindStrings.verificationMapInformation
        ),
        files: [attachment],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
