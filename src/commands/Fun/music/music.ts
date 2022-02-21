import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember } from "discord.js";
import { MusicLocalization } from "@alice-localization/commands/Fun/MusicLocalization";
import { Language } from "@alice-localization/base/Language";

export const run: Command["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    if (!(<GuildMember>interaction.member).voice.channelId) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new MusicLocalization(language).getTranslation("userIsNotInVoiceChannel")
            ),
        });
    }

    CommandHelper.runSubcommandOrGroup(interaction, language);
};

export const category: Command["category"] = CommandCategory.FUN;

export const config: Command["config"] = {
    name: "music",
    description: "Main command for music.",
    options: [
        {
            name: "collections",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Manages music collections.",
            options: [
                {
                    name: "add",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Adds a YouTube URL to a music collection.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the collection.",
                        },
                        {
                            name: "query",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The query to search for the YouTube video.",
                        },
                        {
                            name: "position",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The position at which to insert the new YouTube URL on, ranging from 1 to 10. Defaults to latest.",
                            minValue: 1,
                            maxValue: 10,
                        },
                    ],
                },
                {
                    name: "create",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Creates a new music collection.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the collection.",
                        },
                        {
                            name: "query",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The query to search for the YouTube video.",
                        },
                    ],
                },
                {
                    name: "delete",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Deletes a music collection.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the collection.",
                        },
                    ],
                },
                {
                    name: "enqueue",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Enqueues this music collection into the music queue.",
                },
                {
                    name: "list",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Lists all music collections owned by a user.",
                    options: [
                        {
                            name: "user",
                            type: ApplicationCommandOptionTypes.USER,
                            description: "The user. Defaults to yourself.",
                        },
                    ],
                },
                {
                    name: "remove",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description:
                        "Removes a YouTube URL from a music collection.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the collection.",
                        },
                        {
                            name: "position",
                            required: true,
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The position of the YouTube URL to remove in the music collection's links list.",
                        },
                    ],
                },
                {
                    name: "view",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Views a music collection's information.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description: "The name of the collection.",
                        },
                    ],
                },
            ],
        },
        {
            name: "info",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Shows information about my music status.",
        },
        {
            name: "leave",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Leaves the current voice channel I'm in.",
        },
        {
            name: "nowplaying",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Shows the music that is being played.",
        },
        {
            name: "pause",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Pauses the currently played audio in a voice channel.",
        },
        {
            name: "play",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Plays or enqueues a YouTube video into a voice channel.",
            options: [
                {
                    name: "query",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The query to search for the YouTube video.",
                },
            ],
        },
        {
            name: "queue",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            description: "Manages music queue.",
            options: [
                {
                    name: "add",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Adds a YouTube video into the music queue.",
                    options: [
                        {
                            name: "query",
                            required: true,
                            type: ApplicationCommandOptionTypes.STRING,
                            description:
                                "The query to search for the YouTube video.",
                        },
                        {
                            name: "position",
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The position at which to insert this queue in, ranging from 1 to 10. Defaults to latest.",
                            minValue: 1,
                            maxValue: 10,
                        },
                    ],
                },
                {
                    name: "remove",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Removes an item from the music queue.",
                    options: [
                        {
                            name: "position",
                            required: true,
                            type: ApplicationCommandOptionTypes.INTEGER,
                            description:
                                "The position of the item to remove, ranging from 1 to 10.",
                            minValue: 1,
                            maxValue: 10,
                        },
                    ],
                },
                {
                    name: "view",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    description: "Views the current music queue.",
                },
            ],
        },
        {
            name: "repeat",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Sets repeat mode (whether to repeat music during playback).",
            options: [
                {
                    name: "repeat",
                    required: true,
                    type: ApplicationCommandOptionTypes.BOOLEAN,
                    description: "Whether to enable repeat mode.",
                },
            ],
        },
        {
            name: "resume",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Resumes the currently played audio in a voice channel.",
        },
        {
            name: "shuffle",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Shuffles the current music queue.",
        },
        {
            name: "skip",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Skips the currently played audio in a voice channel.",
        },
    ],
    example: [
        {
            command: "music play",
            arguments: [
                {
                    name: "query",
                    value: "realm of tranquil eternity",
                },
            ],
            description:
                'will search "realm of tranquil eternity" from YouTube and lets you choose which video to play.',
        },
        {
            command: "music queue remove",
            arguments: [
                {
                    name: "position",
                    value: 3,
                },
            ],
            description: "will remove the 3rd music queue in queue list.",
        },
    ],
    cooldown: 10,
    permissions: ["BOT_OWNER"],
    scope: "GUILD_CHANNEL",
};
