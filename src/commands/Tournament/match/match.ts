import { Constants } from "@alice-core/Constants";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember, Snowflake } from "discord.js";

export const run: Command["run"] = async (_, interaction) => {
    const whitelistedGuilds: Snowflake[] = [
        Constants.mainServer,
        Constants.testingServer,
        "526214018269184001"
    ];

    if (!interaction.inGuild() || !whitelistedGuilds.includes(interaction.guildId)) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.notAvailableInServerReject)
        });
    }

    if (!(<GuildMember> interaction.member).roles.cache.find(r => r.name === "Referee")) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.noPermissionReject)
        });
    }

    CommandHelper.runSubcommandFromInteraction(interaction);
};

export const category: Command["category"] = CommandCategory.TOURNAMENT;

export const config: Command["config"] = {
    name: "match",
    description: "Main command for tournament matches.\n\nThis command has a special permission that cannot be modified.",
    options: [
        {
            name: "add",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Adds a match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match, in {<pool ID>.<match ID>} format."
                },
                {
                    name: "name",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The name of the match."
                },
                {
                    name: "team1name",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The name of team 1."
                },
                {
                    name: "team2name",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The name of team 2."
                },
                {
                    name: "team1players",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The players in team 1, in the format {<player name> <uid>} for each player, separated by space."
                },
                {
                    name: "team2players",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The players in team 2, in the format {<player name> <uid>} for each player, separated by space."
                }
            ]
        },
        {
            name: "bind",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Binds a match to the current channel and creates a thread for the match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match."
                }
            ]
        },
        {
            name: "check",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Checks the status of a match.",
            options: [
                {
                    name: "id",
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match. Defaults to the match in current binded thread."
                }
            ]
        },
        {
            name: "end",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Ends a match.",
            options: [
                {
                    name: "id",
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match. Defaults to the match in current binded thread."
                }
            ]
        },
        {
            name: "manualsubmit",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Manually submits a round of score for a match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match."
                },
                {
                    name: "pick",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The current pick (NM1, NM2, etc)."
                },
                {
                    name: "team1scores",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "Scores from team 1, in format {<score>[h] <acc> <miss>} for every player by order in the team."
                },
                {
                    name: "team2scores",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "Scores from team 2, in format {<score>[h] <acc> <miss>} for every player by order in the team."
                }
            ]
        },
        {
            name: "remove",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Removes a match.",
            options: [
                {
                    name: "id",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match."
                }
            ]
        },
        {
            name: "start",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Starts a round in a match. This can only be done in a binded thread (see /match bind).",
            options: [
                {
                    name: "pick",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The current pick (NM1, NM2, etc)."
                }
            ]
        },
        {
            name: "submit",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Submits the most recent play of each player in a match.",
            options: [
                {
                    name: "id",
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match. Defaults to the match in current binded thread."
                },
                {
                    name: "pick",
                    type: CommandArgumentType.STRING,
                    description: "The pick to be submitted. If omitted, uses the most recent play from all participants in the match."
                }
            ]
        },
        {
            name: "unbind",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Unbinds an ended match and closes (archives) its thread.",
            options: [
                {
                    name: "id",
                    type: CommandArgumentType.STRING,
                    description: "The ID of the match. Defaults to the match in current binded thread."
                }
            ]
        },
        {
            name: "undo",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Undo the recent result of a match.",
            options: [
                {
                    name: "id",
                    type: CommandArgumentType.STRING,
                    description: "The match to undo. Defaults to the match in current binded channel."
                }
            ]
        }
    ],
    example: [
        {
            command: "ping",
            description: "will give my websocket ping to Discord."
        }
    ],
    permissions: ["SPECIAL"],
    scope: "GUILD_CHANNEL"
};