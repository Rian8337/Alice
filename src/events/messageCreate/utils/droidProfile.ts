import { Message } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { DroidProfileLocalization } from "@alice-localization/events/messageCreate/droidProfile/DroidProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.author.bot || !message.channel.isSendable()) {
        return;
    }

    for (const arg of message.content.split(/\s+/g)) {
        if (
            !arg.startsWith("http://ops.dgsrz.com/profile") &&
            !arg.startsWith("https://osudroid.moe/profile")
        ) {
            continue;
        }

        const uid = parseInt(<string>arg.split("=").pop());

        if (!NumberHelper.isNumeric(arg)) {
            continue;
        }

        const player = await DroidHelper.getPlayer(uid);

        if (!player) {
            continue;
        }

        const profileImage = <Buffer>(
            await ProfileManager.getProfileStatistics(uid, player)
        );

        message.channel.send({
            content: MessageCreator.createAccept(
                new DroidProfileLocalization(
                    CommandHelper.getLocale(message.author),
                ).getTranslation("droidProfile"),
                `${player.username}:\n<${ProfileManager.getProfileLink(uid)}>`,
            ),
            files: [profileImage],
        });
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for linking osu!droid profile if one is sent.",
    togglePermissions: ["ManageChannels"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
