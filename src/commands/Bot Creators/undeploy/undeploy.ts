import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ApplicationCommand } from "discord.js";
import { UndeployLocalization } from "@alice-localization/commands/Bot Creators/UndeployLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (client, interaction) => {
    const localization: UndeployLocalization = new UndeployLocalization(await CommandHelper.getLocale(interaction));

    const commandName: string = interaction.options.getString("command", true);

    const isDebug: boolean = interaction.options.getBoolean("debug") ?? false;

    if (isDebug) {
        await interaction.guild!.commands.fetch();
    } else {
        await client.application!.commands.fetch();
    }

    const command: ApplicationCommand | undefined = (
        isDebug ? interaction.guild! : client.application!
    ).commands.cache.find((v) => v.name === commandName);

    if (!command) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("commandNotFound")
            ),
        });
    }

    await (isDebug ? interaction.guild! : client.application!).commands.delete(
        command
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("commandUndeploySuccessful"),
            commandName
        ),
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
            type: ApplicationCommandOptionTypes.STRING,
            description: "The command name.",
        },
        {
            name: "debug",
            type: ApplicationCommandOptionTypes.BOOLEAN,
            description: "Whether to undeploy the command in debug server.",
        },
    ],
    example: [
        {
            command: "undeploy command:blacklist",
            arguments: [
                {
                    name: "command",
                    value: "blacklist",
                },
            ],
            description:
                'will undeploy the command with name "blacklist" globally.',
        },
        {
            command: "undeploy command:help debug:True",
            arguments: [
                {
                    name: "command",
                    value: "help",
                },
                {
                    name: "debug",
                    value: true,
                },
            ],
            description:
                'will undeploy the command with name "help" in debug server.',
        },
    ],
    permissions: ["BOT_OWNER"],
    scope: "ALL",
};
