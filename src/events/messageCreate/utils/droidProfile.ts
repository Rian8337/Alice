import { Player } from "@rian8337/osu-droid-utilities";
import { Message } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.author.bot) {
        return;
    }

    for (const arg of message.content.split(/\s+/g)) {
        if (!arg.startsWith("http://ops.dgsrz.com/profile")) {
            continue;
        }

        const uid: number = parseInt(<string>arg.split("=").pop());

        if (!NumberHelper.isNumeric(arg)) {
            continue;
        }

        const player: Player = await Player.getInformation({ uid: uid });

        if (!player.username) {
            continue;
        }

        const profileImage: Buffer = <Buffer>(
            await ProfileManager.getProfileStatistics(uid, player)
        );

        message.channel.send({
            content: MessageCreator.createAccept(
                `osu!droid profile for ${player.username
                }:\n<${ProfileManager.getProfileLink(uid)}>`
            ),
            files: [profileImage],
        });
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for linking osu!droid profile if one is sent.",
    togglePermissions: ["MANAGE_CHANNELS"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
