import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ApplicationCommand } from "discord.js";
import { undeployStrings } from "./undeployStrings";

export const run: Command["run"] = async (client, interaction) => {
    const commandName: string = interaction.options.getString("command", true);

    const isDebug: boolean = interaction.options.getBoolean("debug") ?? false;

    if (isDebug) {
        await interaction.guild!.commands.fetch();
    } else {
        await client.application!.commands.fetch();
    }

    const command: ApplicationCommand | undefined =
        (isDebug ? interaction.guild! : client.application!).commands.cache.find(v => v.name === commandName);

    if (!command) {
        return interaction.editReply({
            content: MessageCreator.createReject(undeployStrings.commandNotFound)
        });
    }

    await (isDebug ? interaction.guild! : client.application!).commands.delete(command);

    interaction.editReply({
        content: MessageCreator.createAccept(undeployStrings.commandUndeploySuccessful, commandName)
    });
};

export const category: Command["category"] = CommandCategory.BOT_CREATORS;

export const config: Command["config"] = {
    name: "undeploy",
    description: "Undeploys a command from Discord.",
    options: [
        {
            name: "command",
            required: true,
            type: CommandArgumentType.STRING,
            description: "The command name."
        },
        {
            name: "debug",
            type: CommandArgumentType.BOOLEAN,
            description: "Whether to undeploy the command in debug server."
        }
    ],
    example: [
        {
            command: "undeploy blacklist",
            description: "will undeploy the command with name \"blacklist\" globally."
        },
        {
            command: "undeploy help true",
            description: "will undeploy the command with name \"help\" in debug server."
        }
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL"
};