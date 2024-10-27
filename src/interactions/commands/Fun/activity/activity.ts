import { CommandCategory } from "@enums/core/CommandCategory";
import { EmbeddedApplication } from "@enums/utils/EmbeddedApplication";
import { ActivityLocalization } from "@localization/interactions/commands/Fun/activity/ActivityLocalization";
import { SlashCommand } from "@structures/core/SlashCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import {
    ApplicationCommandOptionType,
    ChannelType,
    GuildPremiumTier,
    Invite,
    InviteTargetType,
    VoiceChannel,
} from "discord.js";

export const run: SlashCommand["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: ActivityLocalization = new ActivityLocalization(
        CommandHelper.getLocale(interaction),
    );

    const channel: VoiceChannel = <VoiceChannel>(
        interaction.options.getChannel("channel", true)
    );
    const activity: EmbeddedApplication = <EmbeddedApplication>(
        interaction.options.getString("activity", true)
    );

    const requiresBoost: EmbeddedApplication[] = [
        EmbeddedApplication.bobbleLeague,
        EmbeddedApplication.pokerNight,
        EmbeddedApplication.puttParty,
        EmbeddedApplication.landIo,
        EmbeddedApplication.blazing8s,
        EmbeddedApplication.chessInThePark,
        EmbeddedApplication.spellCast,
        EmbeddedApplication.letterLeague,
        EmbeddedApplication.checkersInThePark,
    ];

    if (
        interaction.guild!.premiumTier === GuildPremiumTier.None &&
        requiresBoost.includes(activity)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("serverBoostTierTooLow"),
            ),
        });
    }

    const invite: Invite = await channel.createInvite({
        maxAge: 300,
        targetType: InviteTargetType.EmbeddedApplication,
        targetApplication: activity,
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("inviteLinkResponse"),
            invite.targetApplication!.name!,
            channel.name,
            invite.url,
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.fun;

export const config: SlashCommand["config"] = {
    name: "activity",
    description:
        "Starts an activity in a voice channel. This only works in the desktop or web Discord client.",
    options: [
        {
            name: "channel",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            description: "The voice channel to do the activity in.",
            channelTypes: [ChannelType.GuildVoice],
        },
        {
            name: "activity",
            required: true,
            type: ApplicationCommandOptionType.String,
            description: "The activity to do in the channel.",
            choices: [
                {
                    name: "Watch Together",
                    value: EmbeddedApplication.watchTogether,
                },
                {
                    name: "Sketch Heads",
                    value: EmbeddedApplication.sketchHeads,
                },
                {
                    name: "Know What I Meme (New!)",
                    value: EmbeddedApplication.knowWhatIMeme,
                },
                {
                    name: "Ask Away (New!)",
                    value: EmbeddedApplication.askAway,
                },
                {
                    name: "Word Snacks",
                    value: EmbeddedApplication.wordSnacks,
                },
                {
                    name: "Bobble League (New! Requires Boost Level 1)",
                    value: EmbeddedApplication.bobbleLeague,
                },
                {
                    name: "Poker Night (Requires Boost Level 1)",
                    value: EmbeddedApplication.pokerNight,
                },
                {
                    name: "Putt Party (Requires Boost Level 1)",
                    value: EmbeddedApplication.puttParty,
                },
                {
                    name: "Land-io (Requires Boost Level 1)",
                    value: EmbeddedApplication.landIo,
                },
                {
                    name: "Blazing 8s (Requires Boost Level 1)",
                    value: EmbeddedApplication.blazing8s,
                },
                {
                    name: "Chess In The Park (Requires Boost Level 1)",
                    value: EmbeddedApplication.chessInThePark,
                },
                {
                    name: "SpellCast (Requires Boost Level 1)",
                    value: EmbeddedApplication.spellCast,
                },
                {
                    name: "Letter League (Requires Boost Level 1)",
                    value: EmbeddedApplication.letterLeague,
                },
                {
                    name: "Checkers In The Park (Requires Boost Level 1)",
                    value: EmbeddedApplication.checkersInThePark,
                },
            ],
        },
    ],
    example: [],
    permissions: [],
    scope: "GUILD_CHANNEL",
};
