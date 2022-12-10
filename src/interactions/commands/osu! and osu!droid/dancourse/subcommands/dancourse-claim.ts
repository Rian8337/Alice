import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DanCourse } from "@alice-database/utils/aliceDb/DanCourse";
import { DanCourseLeaderboardScore } from "@alice-database/utils/aliceDb/DanCourseLeaderboardScore";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { DanCourseLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/dancourse/DanCourseLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Role } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization: DanCourseLocalization = new DanCourseLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const course: DanCourse | null =
        await DatabaseManager.aliceDb.collections.danCourses.getCourse(
            interaction.options.getString("name", true)
        );

    if (!course) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("courseNotFound")
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            { projection: { _id: 0, uid: 1 } }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    const score: DanCourseLeaderboardScore | null =
        await DatabaseManager.aliceDb.collections.danCourseLeaderboardScores.getScore(
            bindInfo.uid,
            course.hash
        );

    if (!score) {
        // Check for existing scores.
        const existingScore: boolean =
            await DatabaseManager.aliceDb.collections.danCourseScores.checkExistingScore(
                bindInfo.uid,
                course.hash
            );

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    existingScore
                        ? "threeFingerOrNonPassScoresSubmitted"
                        : "noScoresSubmitted"
                )
            ),
        });
    }

    const role: Role | null = await interaction.guild.roles.fetch(
        course.roleId
    );

    if (role && !interaction.member.roles.cache.has(role.id)) {
        await interaction.member.roles.add(role);
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("userPassedDanCourseSuccess"),
            course.courseName
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
