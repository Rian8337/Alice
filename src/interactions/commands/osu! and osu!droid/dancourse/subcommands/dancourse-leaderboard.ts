import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DanCourse } from "@alice-database/utils/aliceDb/DanCourse";
import { DanCourseLeaderboardScore } from "@alice-database/utils/aliceDb/DanCourseLeaderboardScore";
import { Symbols } from "@alice-enums/utils/Symbols";
import { DanCourseLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/dancourse/DanCourseLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { ScoreRank } from "@alice-structures/utils/ScoreRank";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { Accuracy, ModUtil } from "@rian8337/osu-base";
import { BaseMessageOptions, bold, Collection, EmbedBuilder } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
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

    const arrow: Symbols = Symbols.rightArrowSmall;
    const scoreCache: Collection<number, DanCourseLeaderboardScore[]> =
        new Collection();

    // Check first page first for score availability
    const firstPageScores: DanCourseLeaderboardScore[] =
        await DatabaseManager.aliceDb.collections.danCourseLeaderboardScores.getLeaderboard(
            course.hash,
            1
        );

    if (firstPageScores.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("courseHasNoScores")
            ),
        });
    }

    scoreCache.set(1, firstPageScores);

    const getModString = (score: DanCourseLeaderboardScore): string => {
        let mods: string = "";
        let forcedAR: number | undefined;
        let speedMultiplier: number = 1;

        for (const s of score.modstring.split("|")) {
            if (!s) {
                continue;
            }

            if (s.startsWith("AR")) {
                forcedAR = parseFloat(s.replace("AR", ""));
            } else if (s.startsWith("x")) {
                speedMultiplier = parseFloat(s.slice(1));
            } else {
                mods += s;
            }
        }

        let res: string = ModUtil.droidStringToMods(mods).reduce(
            (a, v) => a + v.acronym,
            ""
        );

        if (res) {
            res = "+" + res;
        }

        if (forcedAR !== undefined || speedMultiplier !== 1) {
            res += " (";

            if (forcedAR !== undefined) {
                res += `AR${forcedAR}`;
            }

            if (speedMultiplier !== 1) {
                if (forcedAR !== undefined) {
                    res += ", ";
                }

                res += `${speedMultiplier}x`;
            }

            res += ")";
        }

        return res;
    };

    const getScoreDescription = (score: DanCourseLeaderboardScore): string => {
        return (
            `${arrow} ${BeatmapManager.getRankEmote(
                <ScoreRank>score.rank
            )} ${arrow} ${NumberHelper.round(
                new Accuracy({
                    n300: score.perfect,
                    n100: score.good,
                    n50: score.bad,
                    nmiss: score.miss,
                }).value() * 100,
                2
            )}%\n` +
            `${arrow} ${bold(
                NumberHelper.round(score.grade, 2).toString()
            )} ${arrow} ${score.score.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )} ${arrow} ${score.maxCombo}x ${arrow} [${score.perfect}/${
                score.good
            }/${score.bad}/${score.miss}]\n` +
            `\`${DateTimeFormatHelper.dateToLocaleString(
                new Date(score.date),
                localization.language
            )}\``
        );
    };

    const onPageChange: OnButtonPageChange = async (options, page) => {
        const actualPage: number = Math.floor((page - 1) / 10);
        const pageRemainder: number = (page - 1) % 20;

        const scores: DanCourseLeaderboardScore[] =
            scoreCache.get(actualPage) ??
            (await DatabaseManager.aliceDb.collections.danCourseLeaderboardScores.getLeaderboard(
                course.hash,
                page
            ));

        if (!scoreCache.has(actualPage)) {
            scoreCache.set(actualPage, scores);
        }

        const embedOptions: BaseMessageOptions = {
            embeds: [EmbedCreator.createNormalEmbed()],
        };
        const embed: EmbedBuilder = <EmbedBuilder>embedOptions.embeds![0];

        const topScore: DanCourseLeaderboardScore = scoreCache.get(1)![0];

        embed.setTitle(course.courseName).addFields({
            name: `${bold(localization.getTranslation("topScore"))}`,
            value: `${bold(
                `${topScore.username}${getModString(topScore)}`
            )}\n${getScoreDescription(topScore)}`,
        });

        const displayedScores: DanCourseLeaderboardScore[] = scores.slice(
            5 * pageRemainder,
            5 + 5 * pageRemainder
        );
        let i = 10 * actualPage + 5 * pageRemainder;

        for (const score of displayedScores) {
            embed.addFields({
                name: `${++i} ${score.username}${getModString(score)}`,
                value: getScoreDescription(score),
            });
        }

        Object.assign(options, embedOptions);
    };

    MessageButtonCreator.createLimitlessButtonBasedPaging(
        interaction,
        {},
        [interaction.user.id],
        1,
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
