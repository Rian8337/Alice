import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { bold, GuildMember, GuildMemberFlags, userMention } from "discord.js";

export const run: EventUtil["run"] = async (
    _,
    oldMember: GuildMember,
    newMember: GuildMember,
) => {
    if (newMember.guild.id !== Constants.mainServer) {
        return;
    }

    // Do not trigger detection for rejoining members and members with verification bypass.
    if (
        newMember.flags.any(
            GuildMemberFlags.DidRejoin | GuildMemberFlags.BypassesVerification,
        )
    ) {
        return;
    }

    if (
        !oldMember.flags.has(GuildMemberFlags.StartedOnboarding) ||
        !newMember.flags.has(GuildMemberFlags.CompletedOnboarding)
    ) {
        return;
    }

    const { joinedTimestamp } = newMember;

    if (joinedTimestamp === null) {
        return;
    }

    const onboardingCompleteDuration = Date.now() - joinedTimestamp;

    // Mark the member as a potential alternate account if they complete onboarding within
    // 30 seconds of their join.
    if (onboardingCompleteDuration > 30000) {
        return;
    }

    const reportChannel = await newMember.guild.channels
        .fetch(Constants.reportChannel)
        .catch(() => null);

    if (!reportChannel?.isSendable()) {
        return;
    }

    await reportChannel.send({
        embeds: [
            EmbedCreator.createNormalEmbed({
                color: "Red",
                timestamp: true,
                footerText: `User ID: ${newMember.id}`,
            })
                .setTitle("Potential Alternate/Spam Account Detected")
                .setDescription(
                    `${bold("User")}: ${newMember.user.tag} (${userMention(newMember.user.id)})\n\n` +
                        `Completed onboarding in ${bold(DateTimeFormatHelper.secondsToDHMS(onboardingCompleteDuration / 1000))} seconds after joining the server.`,
                ),
        ],
    });
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for checking if a newly joined member is a potential alternate or spam account.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GUILD"],
};
