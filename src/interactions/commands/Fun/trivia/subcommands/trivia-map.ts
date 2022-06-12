import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MapTriviaPlayer } from "@alice-interfaces/trivia/MapTriviaPlayer";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import {
    Collection,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Snowflake,
    TextInputComponent,
} from "discord.js";
import {
    MapInfo,
    MathUtils,
    OsuAPIRequestBuilder,
    OsuAPIResponse,
    RequestResponse,
} from "@rian8337/osu-base";
import { TriviaLocalization } from "@alice-localization/interactions/commands/Fun/trivia/TriviaLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { InteractionCollectorCreator } from "@alice-utils/base/InteractionCollectorCreator";
import { Symbols } from "@alice-enums/utils/Symbols";
import { ModalCreator } from "@alice-utils/creators/ModalCreator";
import { TextInputStyles } from "discord.js/typings/enums";
import { TriviaMapCachedAnswer } from "@alice-interfaces/trivia/TriviaMapCachedAnswer";

async function getBeatmaps(fetchAttempt: number = 0): Promise<MapInfo[]> {
    if (fetchAttempt === 5) {
        return [];
    }

    const dateBaseLimit: number = 1199145600000; // January 1st, 2008 0:00 UTC

    const finalDate: Date = new Date(
        dateBaseLimit + Math.floor(Math.random() * (Date.now() - dateBaseLimit))
    );

    const apiRequestBuilder: OsuAPIRequestBuilder = new OsuAPIRequestBuilder()
        .setEndpoint("get_beatmaps")
        .addParameter(
            "since",
            `${finalDate.getUTCFullYear()}-${(finalDate.getUTCMonth() + 1)
                .toString()
                .padStart(2, "0")}-${finalDate
                .getUTCDate()
                .toString()
                .padStart(2, "0")}`
        )
        .addParameter("m", 0);

    const result: RequestResponse = await apiRequestBuilder.sendRequest();

    if (result.statusCode !== 200) {
        return getBeatmaps(++fetchAttempt);
    }

    const data: OsuAPIResponse[] = JSON.parse(result.data.toString("utf-8"));

    if (data.length === 0) {
        return getBeatmaps(++fetchAttempt);
    }

    const beatmapList: MapInfo[] = [];

    data.forEach((v) => {
        const beatmapInfo: MapInfo = new MapInfo().fillMetadata(v);

        if (
            !beatmapList.find(
                (map) => map.beatmapsetID === beatmapInfo.beatmapsetID
            )
        ) {
            beatmapList.push(beatmapInfo);
        }
    });

    return beatmapList;
}

function shuffleString(
    str: string,
    amount: number
): {
    readonly splittedString: string[];
    readonly replacedStrings: {
        readonly char: string;
        readonly indexes: number[];
    }[];
} {
    const regex: RegExp = /^[a-zA-Z0-9]+$/;
    const replacementStr = " `-` ";
    const splitStr: string[] = str.split("");
    const replacedStrings: { char: string; indexes: number[] }[] = [];

    while (amount--) {
        const index: number = Math.floor(Math.random() * str.length);

        const char: string = str.charAt(index).toUpperCase();

        if (!regex.test(char) || replacedStrings.find((r) => r.char === char)) {
            ++amount;
            continue;
        }

        const replacedIndexes: number[] = [];

        for (let i = 0; i < splitStr.length; ++i) {
            if (splitStr[i].toUpperCase() === char) {
                replacedIndexes.push(i);
                splitStr[i] = replacementStr;
            }
        }

        replacedStrings.push({
            char: char,
            indexes: replacedIndexes,
        });
    }

    return {
        splittedString: splitStr,
        replacedStrings: replacedStrings,
    };
}

function createEmbed(
    level: number,
    beatmapInfo: MapInfo,
    artist: string,
    title: string,
    localization: TriviaLocalization
): MessageEmbed {
    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: "#fccf03",
    });

    embed
        .setAuthor({
            name: localization.getTranslation("beatmapHint"),
        })
        .setTitle(`${localization.getTranslation("level")} ${level}`)
        .setDescription(
            `**${localization.getTranslation(
                "beatmapArtist"
            )}:** ${artist}\n**${localization.getTranslation(
                "beatmapTitle"
            )}**: ${title}${
                beatmapInfo.source
                    ? `\n**${localization.getTranslation("beatmapSource")}**: ${
                          beatmapInfo.source
                      }`
                    : ""
            }`
        )
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapInfo.beatmapsetID}l.jpg`)
        .setImage(
            `https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapsetID}/covers/cover.jpg`
        );

    return embed;
}

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: TriviaLocalization = new TriviaLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (CacheManager.mapTriviaAnswers.has(interaction.channelId)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("channelHasMapTriviaActive")
            ),
        });
    }

    let level: number = 1;
    const statistics: Collection<Snowflake, MapTriviaPlayer> = new Collection();
    let beatmapCache: MapInfo[] = [];
    let hasEnded: boolean = false;

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("mapTriviaStarted")
        ),
    });

    const answerCollection: Collection<Snowflake, TriviaMapCachedAnswer> =
        new Collection();

    CacheManager.mapTriviaAnswers.set(interaction.channelId, answerCollection);

    const answersEmbed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    // Run game in constant loop
    while (!hasEnded) {
        let beatmapInfoIndex: number = beatmapCache.findIndex(
            (v) =>
                v.plays <= 10000000 - 200 * level ||
                v.favorites <= 1000000 - 20 * level
        );

        while (beatmapInfoIndex === -1) {
            beatmapCache = await getBeatmaps();

            if (beatmapCache.length === 0) {
                break;
            }

            beatmapInfoIndex = beatmapCache.findIndex(
                (v) =>
                    v.plays <= 10000000 - 100 * level ||
                    v.favorites <= 1000000 - 10 * level
            );
        }

        if (beatmapInfoIndex === -1) {
            await interaction.channel!.send({
                content: MessageCreator.createReject(
                    localization.getTranslation("couldNotRetrieveBeatmaps")
                ),
            });

            break;
        }

        const beatmapInfo: MapInfo = beatmapCache.splice(
            beatmapInfoIndex,
            1
        )[0];

        const tempArtist: string = beatmapInfo.artist.replace(/\W|_/g, "");
        const tempTitle: string = beatmapInfo.title.replace(/\W|_/g, "");

        // Shuffling empty words
        // Shuffle between 25-75% of title and artist
        const artistBlankAmount: number = Math.max(
            Math.ceil(tempArtist.length / 4),
            Math.floor(
                Math.min(
                    (level * tempArtist.length) / 20,
                    (tempArtist.length * 3) / 4
                )
            )
        );
        const titleBlankAmount: number = Math.max(
            Math.ceil(tempTitle.length / 4),
            Math.floor(
                Math.min(
                    (level * tempTitle.length) / 20,
                    (tempTitle.length * 3) / 4
                )
            )
        );

        const artistGuessData = shuffleString(
            beatmapInfo.artist,
            artistBlankAmount
        );
        const titleGuessData = shuffleString(
            beatmapInfo.title,
            titleBlankAmount
        );

        const button: MessageButton = new MessageButton()
            .setCustomId("answerMapTrivia")
            .setStyle("PRIMARY")
            .setLabel(localization.getTranslation("answerQuestion"))
            .setEmoji(Symbols.memo);

        const component: MessageActionRow =
            new MessageActionRow().addComponents(button);

        const message: Message = await interaction.channel!.send({
            content: MessageCreator.createWarn(
                localization.getTranslation("guessBeatmap")
            ),
            embeds: [
                createEmbed(
                    level,
                    beatmapInfo,
                    artistGuessData.splittedString.join("").trim(),
                    titleGuessData.splittedString.join("").trim(),
                    localization
                ),
            ],
            components: [component],
        });

        const totalCharCountToReplace: number =
            artistGuessData.replacedStrings.reduce(
                (a, v) => a + v.indexes.length,
                0
            ) +
            titleGuessData.replacedStrings.reduce(
                (a, v) => a + v.indexes.length,
                0
            );
        let replacedCharCount: number = 0;

        let editCount: number = 0;
        const maxEditCount: number = 5;

        const revealCharInterval: NodeJS.Timer = setInterval(async () => {
            if (editCount === maxEditCount - 1) {
                clearInterval(revealCharInterval);
            }

            ++editCount;

            // Obtain portion of character amount to replace.
            const charCountToReplace: number = Math.floor(
                Math.pow(
                    (totalCharCountToReplace * editCount) /
                        (maxEditCount * 1.5),
                    0.8
                )
            );

            while (replacedCharCount < charCountToReplace) {
                let data: {
                    readonly splittedString: string[];
                    readonly replacedStrings: {
                        readonly char: string;
                        readonly indexes: number[];
                    }[];
                };

                // Determine what to randomize.
                if (
                    artistGuessData.replacedStrings.length > 1 &&
                    titleGuessData.replacedStrings.length > 1
                ) {
                    data =
                        Math.random() > 0.5 ? artistGuessData : titleGuessData;
                } else if (artistGuessData.replacedStrings.length > 1) {
                    data = artistGuessData;
                } else if (titleGuessData.replacedStrings.length > 1) {
                    data = titleGuessData;
                } else {
                    clearInterval(revealCharInterval);

                    return;
                }

                const replacedStringIndex: number = Math.floor(
                    Math.random() * data.replacedStrings.length
                );

                const selectedData = data.replacedStrings[replacedStringIndex];

                const charIndex: number = Math.floor(
                    Math.random() * selectedData.indexes.length
                );

                data.splittedString[selectedData.indexes[charIndex]] =
                    selectedData.char;

                selectedData.indexes.splice(charIndex, 1);

                if (selectedData.indexes.length === 0) {
                    data.replacedStrings.splice(replacedStringIndex, 1);
                }

                ++replacedCharCount;
            }

            await message.edit({
                embeds: [
                    createEmbed(
                        level,
                        beatmapInfo,
                        artistGuessData.splittedString.join("").trim(),
                        titleGuessData.splittedString.join("").trim(),
                        localization
                    ),
                ],
            });
        }, 45000 / maxEditCount);

        const { collector } = InteractionCollectorCreator.createButtonCollector(
            message,
            45,
            (i) => button.customId === i.customId,
            (m) => {
                const row: MessageActionRow | undefined = m.components.find(
                    (c) => c.components.length === 1
                );

                if (!row) {
                    return false;
                }

                return row.components[0].customId === button.customId;
            }
        );

        await new Promise<void>((resolve) => {
            collector.on("collect", async (i) => {
                const playerLocalization: TriviaLocalization =
                    new TriviaLocalization(await CommandHelper.getLocale(i));

                const answer: TriviaMapCachedAnswer | undefined =
                    answerCollection.get(i.user.id);

                const textInputComponents: TextInputComponent[] = [];

                if (
                    answer?.answer.artist.toLowerCase() !==
                    beatmapInfo.artist.toLowerCase()
                ) {
                    textInputComponents.push(
                        new TextInputComponent()
                            .setCustomId("artist")
                            .setRequired(true)
                            .setStyle(TextInputStyles.SHORT)
                            .setLabel(
                                playerLocalization.getTranslation(
                                    "answerModalArtistLabel"
                                )
                            )
                            .setPlaceholder(
                                playerLocalization.getTranslation(
                                    "answerModalArtistPlaceholder"
                                )
                            )
                    );
                }

                if (
                    answer?.answer.title.toLowerCase() !==
                    beatmapInfo.title.toLowerCase()
                ) {
                    textInputComponents.push(
                        new TextInputComponent()
                            .setCustomId("title")
                            .setRequired(true)
                            .setStyle(TextInputStyles.SHORT)
                            .setLabel(
                                playerLocalization.getTranslation(
                                    "answerModalTitleLabel"
                                )
                            )
                            .setPlaceholder(
                                playerLocalization.getTranslation(
                                    "answerModalTitlePlaceholder"
                                )
                            )
                    );
                }

                if (textInputComponents.length === 0) {
                    i.ephemeral = true;

                    await InteractionHelper.reply(i, {
                        content: MessageCreator.createReject(
                            playerLocalization.getTranslation(
                                "answerIsAlreadyCorrect"
                            )
                        ),
                    });

                    return;
                }

                ModalCreator.createModal(
                    i,
                    "trivia-map-answer",
                    playerLocalization.getTranslation("answerModalTitle"),
                    ...textInputComponents
                );
            });

            collector.once("end", async () => {
                const beatmapEmbed: MessageEmbed = createEmbed(
                    level,
                    beatmapInfo,
                    beatmapInfo.artist,
                    beatmapInfo.title,
                    localization
                );

                // Remove buttons from original message
                await message.edit({
                    embeds: [beatmapEmbed],
                    components: [],
                });

                beatmapEmbed
                    .setAuthor({
                        name: localization.getTranslation("beatmapInfo"),
                    })
                    .setTitle(
                        `${beatmapInfo.artist} - ${beatmapInfo.title} by ${beatmapInfo.creator}`
                    )
                    .setURL(`https://osu.ppy.sh/s/${beatmapInfo.beatmapsetID}`)
                    .setDescription(
                        `${beatmapInfo.showStatistics(
                            1
                        )}\n${beatmapInfo.showStatistics(
                            6
                        )}\n${beatmapInfo.showStatistics(7)}`
                    )
                    .setColor(beatmapInfo.statusColor);

                const correctAnswers: TriviaMapCachedAnswer[] = [];

                for (const [, answer] of answerCollection) {
                    if (
                        answer.answer.artist.toLowerCase() ===
                            beatmapInfo.artist.toLowerCase() ||
                        answer.answer.title.toLowerCase() ===
                            beatmapInfo.title.toLowerCase()
                    ) {
                        const playerStats: MapTriviaPlayer = statistics.get(
                            answer.user.id
                        ) ?? {
                            id: answer.user.id,
                            score: 0,
                        };

                        if (
                            answer.answer.artist.toLowerCase() ===
                            beatmapInfo.artist.toLowerCase()
                        ) {
                            playerStats.score +=
                                level / 10 +
                                MathUtils.round(
                                    Math.max(
                                        0,
                                        1 -
                                            (answer.artistAnswerSubmissionTime -
                                                message.createdTimestamp) /
                                                1000 /
                                                45
                                    ),
                                    2
                                );
                        }

                        if (
                            answer.answer.title.toLowerCase() ===
                            beatmapInfo.title.toLowerCase()
                        ) {
                            playerStats.score +=
                                level / 10 +
                                MathUtils.round(
                                    Math.max(
                                        0,
                                        1 -
                                            (answer.artistAnswerSubmissionTime -
                                                message.createdTimestamp) /
                                                1000 /
                                                45
                                    ),
                                    2
                                );
                        }

                        statistics.set(answer.user.id, playerStats);

                        correctAnswers.push(answer);
                    }
                }

                if (correctAnswers.length > 0) {
                    answersEmbed
                        .spliceFields(0, answersEmbed.fields.length)
                        .setDescription(
                            localization.getTranslation("correctAnswerGotten")
                        )
                        .addField(
                            localization.getTranslation(
                                "answerEmbedArtistGuessTitle"
                            ),
                            correctAnswers
                                .filter(
                                    (v) =>
                                        v.answer.artist === beatmapInfo.artist
                                )
                                .sort(
                                    (a, b) =>
                                        a.artistAnswerSubmissionTime -
                                        b.artistAnswerSubmissionTime
                                )
                                .map(
                                    (v) =>
                                        `${v.user.username} - ${MathUtils.round(
                                            (v.artistAnswerSubmissionTime -
                                                message.createdTimestamp) /
                                                1000,
                                            3
                                        )} s`
                                )
                                .join("\n") ||
                                localization.getTranslation("none")
                        )
                        .addField(
                            localization.getTranslation(
                                "answerEmbedTitleGuessTitle"
                            ),
                            correctAnswers
                                .filter(
                                    (v) => v.answer.title === beatmapInfo.title
                                )
                                .sort(
                                    (a, b) =>
                                        a.titleAnswerSubmissionTime -
                                        b.titleAnswerSubmissionTime
                                )
                                .map(
                                    (v) =>
                                        `${v.user.username} - ${MathUtils.round(
                                            (v.titleAnswerSubmissionTime -
                                                message.createdTimestamp) /
                                                1000,
                                            3
                                        )} s`
                                )
                                .join("\n") ||
                                localization.getTranslation("none")
                        );

                    await message.reply({
                        embeds: [answersEmbed, beatmapEmbed],
                    });

                    ++level;

                    answerCollection.clear();
                } else {
                    await message.reply({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                "correctAnswerNotGotten"
                            )
                        ),
                        embeds: [beatmapEmbed],
                    });

                    hasEnded = true;
                }

                resolve();
            });
        });
    }

    CacheManager.mapTriviaAnswers.delete(interaction.channelId);

    statistics.sort((a, b) => {
        return b.score - a.score;
    });

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: "#037ffc",
    });

    embed
        .setTitle(localization.getTranslation("gameInfo"))
        .setDescription(
            `**${localization.getTranslation("starter")}**: ${
                interaction.user
            }\n` +
                `**${localization.getTranslation(
                    "timeStarted"
                )}**: ${DateTimeFormatHelper.dateToLocaleString(
                    interaction.createdAt,
                    localization.language
                )}\n` +
                `**${localization.getTranslation(
                    "duration"
                )}**: ${DateTimeFormatHelper.secondsToDHMS(
                    Math.floor(
                        (Date.now() - interaction.createdTimestamp) / 1000
                    ),
                    localization.language
                )}\n` +
                `**${localization.getTranslation("level")}**: ${level}`
        )
        .addField(
            localization.getTranslation("leaderboard"),
            [...statistics.values()]
                .slice(0, 10)
                .map(
                    (v, i) => `**#${i + 1}**: <@${v.id}>: ${v.score.toFixed(2)}`
                )
                .join("\n") || localization.getTranslation("none")
        );

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("gameEnded")
        ),
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
