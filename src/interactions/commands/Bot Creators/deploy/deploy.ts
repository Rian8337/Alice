import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    PermissionsString,
} from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ApplicationCommandData } from "discord.js";
import { DeployLocalization } from "@alice-localization/interactions/commands/Bot Creators/deploy/DeployLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ContextMenuCommand } from "structures/core/ContextMenuCommand";

export const run: SlashCommand["run"] = async (client, interaction) => {
    const localization: DeployLocalization = new DeployLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const commandName: string = interaction.options.getString("command", true);

    let data: ApplicationCommandData;

    const type: ApplicationCommandType =
        interaction.options.getInteger("type") ??
        ApplicationCommandType.ChatInput;

    if (type === ApplicationCommandType.ChatInput) {
        const command: SlashCommand | undefined =
            client.interactions.chatInput.get(commandName);

        if (!command) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("commandNotFound")
                ),
            });
        }

        data = {
            name: command.config.name,
            description: command.config.description,
            options: command.config.options,
            dmPermission:
                command.config.scope === "DM" || command.config.scope === "ALL",
            defaultMemberPermissions:
                command.config.permissions.length > 0 &&
                command.config.scope === "GUILD_CHANNEL" &&
                (command.config.permissions.includes("BotOwner") ||
                    command.config.permissions.includes("Special"))
                    ? []
                    : <PermissionsString[]>command.config.permissions,
        };
    } else {
        const command: ContextMenuCommand | undefined = (
            type === ApplicationCommandType.Message
                ? client.interactions.contextMenu.message
                : client.interactions.contextMenu.user
        ).get(commandName);

        if (!command) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("commandNotFound")
                ),
            });
        }

        data = {
            name: command.config.name,
            description: "",
            type: type,
        };
    }

    await (interaction.options.getBoolean("serveronly")
        ? interaction.guild!
        : client.application!
    ).commands.create(data);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("commandDeploySuccessful"),
            commandName
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.BOT_CREATORS;

export const config: SlashCommand["config"] = {
    name: "deploy",
    description: "Deploys a command to Discord.",
    options: [
        {
            name: "command",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The command name.",
        },
        {
            name: "serveronly",
            type: ApplicationCommandOptionType.Boolean,
            description:
                "Whether to only deploy the command in the server this command is executed in.",
        },
        {
            name: "type",
            type: ApplicationCommandOptionType.Integer,
            description: "The type of the command. Defaults to chat input.",
            choices: [
                {
                    name: "Chat Input",
                    value: ApplicationCommandType.ChatInput,
                },
                {
                    name: "User Context Menu",
                    value: ApplicationCommandType.User,
                },
                {
                    name: "Message Context Menu",
                    value: ApplicationCommandType.Message,
                },
            ],
        },
    ],
    example: [
        {
            command: "deploy",
            arguments: [
                {
                    name: "command",
                    value: "blacklist",
                },
            ],
            description:
                'will deploy the command with name "blacklist" globally.',
        },
        {
            command: "deploy",
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
                'will deploy the command with name "help" in debug server.',
        },
    ],
    permissions: ["BotOwner"],
    scope: "ALL",
    replyEphemeral: true,
};
