import { Message, Snowflake } from "discord.js";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "structures/core/EventUtil";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { CuteNoLewdLocalization } from "@alice-localization/events/messageCreate/cuteNoLewd/CuteNoLewdLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

const pictureCooldown: Set<Snowflake> = new Set();

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.channel.id !== "686948895212961807" || message.author.bot) {
        return;
    }

    if (
        message.attachments.size > 0 &&
        pictureCooldown.has(message.author.id)
    ) {
        await message.delete();

        const localization: CuteNoLewdLocalization = new CuteNoLewdLocalization(
            await CommandHelper.getLocale(message.author)
        );

        message.channel
            .send(
                MessageCreator.createWarn(
                    localization.getTranslation("imageSentTooFast"),
                    message.author.toString()
                )
            )
            .then((m) => setTimeout(() => m.delete(), 5 * 1000));

        return;
    }

    const images: string[] = [];

    for (const part of message.content.split(/\s+/g)) {
        if (StringHelper.isValidImage(part)) {
            images.push(encodeURI(part));
        }
    }

    if (images.length + message.attachments.size === 0) {
        return;
    }

    pictureCooldown.add(message.author.id);

    setTimeout(() => {
        pictureCooldown.delete(message.author.id);
    }, 5000);

    await message.react(Symbols.thumbsUp);
    await message.react(Symbols.thumbsDown);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for giving thumbs up and down reactions for pictures in #cute-no-lewd.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
