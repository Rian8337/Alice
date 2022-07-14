import { EventUtil } from "structures/core/EventUtil";
import { MessageAttachment, TextChannel } from "discord.js";

export const run: EventUtil["run"] = async (client, error: Error) => {
    const errorLogChannel: TextChannel = <TextChannel>(
        await client.channels.fetch("833903416475516939")
    );

    client.logger.error(error);

    if (!errorLogChannel) {
        return;
    }

    const attachment: MessageAttachment = new MessageAttachment(
        Buffer.from(<string>error.stack),
        "stack.txt"
    );

    errorLogChannel.send({
        content: `[${new Date().toUTCString()}] Error occurred: ${
            error.message
        }`,
        files: [attachment],
    });
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging errors to the error log channel.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
