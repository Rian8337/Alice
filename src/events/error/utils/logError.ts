import { EventUtil } from "structures/core/EventUtil";
import { AttachmentBuilder, TextChannel } from "discord.js";
import { consola } from "consola";

export const run: EventUtil["run"] = async (client, error: Error) => {
    const errorLogChannel: TextChannel = <TextChannel>(
        await client.channels.fetch("833903416475516939")
    );

    consola.error(error);

    if (!errorLogChannel) {
        return;
    }

    const attachment: AttachmentBuilder = new AttachmentBuilder(
        Buffer.from(error.stack!),
        { name: "stack.txt" }
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
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
