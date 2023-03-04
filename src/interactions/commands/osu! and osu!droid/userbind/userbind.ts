import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { ApplicationCommandOptionType } from "discord.js";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Constants } from "@alice-core/Constants";

export const run: SlashCommand["run"] = async (_, interaction) => {
    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.osu;

export const config: SlashCommand["config"] = {
    name: "userbind",
    description:
        "Main command for binding osu!droid accounts to Discord accounts.",
    options: [
        {
            name: "uid",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Switches your currently binded osu!droid account or binds an osu!droid account using its uid.",
            options: [
                {
                    name: "uid",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                    description: "The uid of the osu!droid account.",
                    minValue: Constants.uidMinLimit,
                },
                {
                    name: "email",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The email associated with the osu!droid account. Required for first-time bind of the account.",
                },
            ],
        },
        {
            name: "username",
            type: ApplicationCommandOptionType.Subcommand,
            description:
                "Switches your currently binded osu!droid account or binds an osu!droid account using its username.",
            options: [
                {
                    name: "username",
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "The username of the osu!droid account.",
                    minLength: 2,
                    maxLength: 20,
                },
                {
                    name: "email",
                    type: ApplicationCommandOptionType.String,
                    description:
                        "The email associated with the osu!droid account. Required for first-time bind of the account.",
                },
            ],
        },
    ],
    example: [
        {
            command: "userbind uid",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
            ],
            description:
                "will bind your Discord account to the osu!droid account with uid 51076.",
        },
        {
            command: "userbind username",
            arguments: [
                {
                    name: "username",
                    value: "NeroYuki",
                },
            ],
            description:
                "will bind your Discord account to the osu!droid account with username NeroYuki.",
        },
    ],
    cooldown: 5,
    permissions: [],
    scope: "ALL",
    replyEphemeral: true,
};
