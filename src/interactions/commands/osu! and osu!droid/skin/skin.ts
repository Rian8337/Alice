import { ApplicationCommandOptionType } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SkinPreviewType } from "@alice-enums/utils/SkinPreviewType";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "skin",
    description:
        "View a Discord account's osu! or osu!droid skin or set your own.",
    options: [
        {
            name: "add",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Adds a skin.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the skin.",
                    maxLength: 20,
                },
                {
                    name: "link",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The link to the skin.",
                },
            ],
        },
        {
            name: "delete",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Deletes a skin.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The name of the skin.",
                    maxLength: 20,
                },
            ],
        },
        {
            name: "edit",
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: "Subcommand group for modifying skin information.",
            options: [
                {
                    name: "description",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Modifies a skin's description.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The name of the skin.",
                            maxLength: 20,
                        },
                        {
                            name: "description",
                            type: ApplicationCommandOptionType.String,
                            description:
                                "The new description of the skin. Defaults to none.",
                            maxLength: 100,
                        },
                    ],
                },
                {
                    name: "link",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Modifies a skin's link.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The name of the skin.",
                            maxLength: 20,
                        },
                        {
                            name: "link",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The new link of the skin.",
                        },
                    ],
                },
                {
                    name: "name",
                    type: ApplicationCommandOptionType.Subcommand,
                    description: "Modifies a skin's name.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The name of the skin.",
                            maxLength: 20,
                        },
                        {
                            name: "newname",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The new name of the skin.",
                            maxLength: 20,
                        },
                    ],
                },
                {
                    name: "previewimage",
                    type: ApplicationCommandOptionType.Subcommand,
                    description:
                        "Modifies the image previews of a skin in the website.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The name of the skin.",
                            maxLength: 20,
                        },
                        {
                            name: "type",
                            required: true,
                            type: ApplicationCommandOptionType.String,
                            description: "The preview type.",
                            choices: [
                                {
                                    name: "Gameplay",
                                    value: SkinPreviewType.gameplay,
                                },
                                {
                                    name: "Song Selection Menu",
                                    value: SkinPreviewType.songSelectionMenu,
                                },
                                {
                                    name: "Mod Selection Menu",
                                    value: SkinPreviewType.modSelectionMenu,
                                },
                            ],
                        },
                        {
                            name: "image",
                            type: ApplicationCommandOptionType.Attachment,
                            description:
                                "The new preview image. Defaults to none.",
                        },
                    ],
                },
            ],
        },
        {
            name: "list",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Lists all skin owned by a user.",
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "The user. Defaults to yourself.",
                },
            ],
        },
    ],
    example: [
        {
            command: "skin view",
            description: "will view your own skin.",
        },
        {
            command: "skin view",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description: "will view Rian8337's skin.",
        },
        {
            command: "skin set",
            arguments: [
                {
                    name: "url",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description: "will set your skin to the specified URL.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
