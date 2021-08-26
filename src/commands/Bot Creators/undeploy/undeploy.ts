import { Constants } from "@alice-core/Constants";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Guild } from "discord.js";
import { undeployStrings } from "./undeployStrings";

export const run: Command["run"] = async (client, interaction) => {
    const commandName: string = interaction.options.getString("command", true);

    const command: Command | undefined = client.commands.get(commandName);

    if (!command) {
        return interaction.editReply({
            content: MessageCreator.createReject(undeployStrings.commandNotFound)
        });
    }

    if (interaction.options.getBoolean("debug")) {
        const guild: Guild = await client.guilds.fetch(Constants.testingServer);

        await guild.commands.fetch();

        await guild.commands.cache.find(v => v.name === commandName)?.delete();
    } else {
        await client.application?.commands.cache.find(v => v.name === commandName)?.delete();
    }

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