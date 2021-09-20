import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember } from "discord.js";
import { musicStrings } from "./musicStrings";

export const run: Command["run"] = async (_, interaction) => {
    if (!(<GuildMember> interaction.member).voice.channelId) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.userIsNotInVoiceChannel)
        });
    }

    CommandHelper.runSubcommandOrGroup(interaction);
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
    name: "music",
    description: "Main command for music.",
    options: [
        {
            name: "info",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shows information about my music status."
        },
        {
            name: "leave",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Leaves the current voice channel I'm in."
        },
        {
            name: "nowplaying",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shows the music that is being played."
        },
        {
            name: "pause",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Pauses the currently played audio in a voice channel."
        },
        {
            name: "play",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Plays or enqueues a YouTube video into a voice channel.",
            options: [
                {
                    name: "query",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The query to search for the YouTube video."
                }
            ]
        },
        {
            name: "queue",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Manages music queue.",
            options: [
                {
                    name: "add",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Adds a YouTube video into the music queue.",
                    options: [
                        {
                            name: "query",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The query to search for the YouTube video."
                        },
                        {
                            name: "position",
                            type: CommandArgumentType.INTEGER,
                            description: "The position at which to insert this queue in, ranging from 1 to 10. Defaults to latest."
                        }
                    ]
                },
                {
                    name: "remove",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Removes an item from the music queue.",
                    options: [
                        {
                            name: "position",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The position of the item to remove, ranging from 1 to 10."
                        }
                    ]
                },
                {
                    name: "view",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Views the current music queue."
                }
            ]
        },
        {
            name: "repeat",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Sets repeat mode (whether to repeat music during playback).",
            options: [
                {
                    name: "repeat",
                    required: true,
                    type: CommandArgumentType.BOOLEAN,
                    description: "Whether to enable repeat mode."
                }
            ]
        },
        {
            name: "resume",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Resumes the currently played audio in a voice channel."
        },
        {
            name: "shuffle",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Shuffles the current music queue."
        },
        {
            name: "skip",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Skips the currently played audio in a voice channel."
        }
    ],
    example: [
        {
            command: "music play",
            arguments: [
                {
                    name: "query",
                    value: "realm of tranquil eternity"
                }
            ],
            description: "will search \"realm of tranquil eternity\" from YouTube and lets you choose which video to play."
        },
        {
            command: "music queue remove",
            arguments: [
                {
                    name: "position",
                    value: 3
                }
            ],
            description: "will remove the 3rd music queue in queue list."
        }
    ],
    cooldown: 10,
    permissions: ["BOT_OWNER"],
    scope: "GUILD_CHANNEL"
};