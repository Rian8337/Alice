import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { DanCourse } from "@database/utils/aliceDb/DanCourse";
import { DanCourseLeaderboardScore } from "@database/utils/aliceDb/DanCourseLeaderboardScore";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { Language } from "@localization/base/Language";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { DanCourseLocalization } from "@localization/interactions/commands/osu! and osu!droid/dancourse/DanCourseLocalization";
import { OperationResult } from "@structures/core/OperationResult";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { Role } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language: Language = CommandHelper.getLocale(interaction);

    if (interaction.channelId !== "1054373588871958558") {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.notAvailableInChannelReject,
                ),
            ),
        });
    }

    const localization: DanCourseLocalization = new DanCourseLocalization(
        language,
    );

    const course: DanCourse | null =
        await DatabaseManager.aliceDb.collections.danCourses.getCourse(
            interaction.options.getString("name", true),
        );

    if (!course) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("courseNotFound"),
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            { projection: { _id: 0, uid: 1 } },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    const score: DanCourseLeaderboardScore | null =
        await DatabaseManager.aliceDb.collections.danCourseLeaderboardScores.getScore(
            bindInfo.uid,
            course.hash,
        );

    if (!score) {
        // Check for existing scores.
        const existingScore: boolean =
            await DatabaseManager.aliceDb.collections.danCourseScores.checkExistingScore(
                bindInfo.uid,
                course.hash,
            );

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    existingScore
                        ? "threeFingerOrNonPassScoresSubmitted"
                        : "noScoresSubmitted",
                ),
            ),
        });
    }

    const passStatus: OperationResult = course.isScorePassed(score);

    if (!passStatus.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userPassedDanCourseFailed"),
                course.courseName,
                passStatus.reason!,
            ),
        });
    }

    const role: Role | null = await interaction.guild.roles.fetch(
        course.roleId,
    );

    if (role && !interaction.member.roles.cache.has(role.id)) {
        await interaction.member.roles.add(role);
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("userPassedDanCourseSuccess"),
            course.courseName,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
