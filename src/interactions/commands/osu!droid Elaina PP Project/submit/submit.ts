import { Config } from "@alice-core/Config";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "@alice-interfaces/core/SlashCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { SubmitLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/submit/SubmitLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (_, interaction) => {
    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !Config.ppChannel.includes(interaction.channel!.id)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new SubmitLocalization(
                    await CommandHelper.getLocale(interaction)
                ).getTranslation("commandNotAllowed")
            ),
        }).then(() => setTimeout(() => interaction.deleteReply(), 5 * 1000));
    }

    CommandHelper.runSlashSubcommandFromInteraction(interaction);
};

export const category: SlashCommand["category"] = CommandCategory.PP;

export const config: SlashCommand["config"] = {
    name: "submit",
    description:
        "Submits one or more score(s) the droid pp and ranked score system.",
    options: [
        {
            name: "beatmap",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Submit a score from a beatmap.",
            options: [
                {
                    name: "beatmap",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The beatmap ID or link.",
                },
            ],
        },
        {
            name: "recent",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description: "Submit score(s) from your recent plays.",
            options: [
                {
                    name: "amount",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The amount of score(s) to submit, ranging from 1 to 5. Defaults to 1.",
                    minValue: 1,
                    maxValue: 5,
                },
                {
                    name: "offset",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The index offset in your recent play list that you want to start submitting, ranging from 1 to 50.",
                    minValue: 1,
                    maxValue: 50,
                },
            ],
        },
    ],
    example: [
        {
            command: "submit recent",
            description: "will submit your most recent play.",
        },
        {
            command: "submit recent",
            arguments: [
                {
                    name: "amount",
                    value: 3,
                },
            ],
            description:
                "will submit your 1st, 2nd, and 3rd most recent plays.",
        },
        {
            command: "submit recent",
            arguments: [
                {
                    name: "amount",
                    value: 4,
                },
                {
                    name: "offset",
                    value: 18,
                },
            ],
            description:
                "will submit your 18th, 19th, 20th, and 21th most recent plays.",
        },
        {
            command: "submit beatmap",
            arguments: [
                {
                    name: "beatmap",
                    value: "https://osu.ppy.sh/beatmapsets/902745#osu/1884658",
                },
            ],
            description: "will submit your score from the linked beatmap.",
        },
        {
            command: "submit beatmap",
            arguments: [
                {
                    name: "beatmap",
                    value: 1884658,
                },
            ],
            description:
                "will submit your score from the beatmap with that ID.",
        },
    ],
    permissions: [],
    cooldown: 5,
    scope: "GUILD_CHANNEL",
};
