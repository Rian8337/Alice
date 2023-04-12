import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MapTriviaPlayer } from "@alice-structures/trivia/MapTriviaPlayer";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import {
    Collection,
    GuildMember,
    Message,
    EmbedBuilder,
    Snowflake,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    APIButtonComponentWithCustomId,
    ActionRow,
    MessageActionRowComponent,
    TextInputBuilder,
    TextInputStyle,
    bold,
    userMention,
} from "discord.js";
import {
    MapInfo,
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
import { TriviaMapCachedAnswer } from "@alice-structures/trivia/TriviaMapCachedAnswer";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

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
): EmbedBuilder {
    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        color: "#fccf03",
    });

    embed
        .setAuthor({
            name: localization.getTranslation("beatmapHint"),
        })
        .setTitle(`${localization.getTranslation("level")} ${level}`)
        .setDescription(
            `${bold(
                localization.getTranslation("beatmapArtist")
            )}: ${artist}\n${bold(
                localization.getTranslation("beatmapTitle")
            )}: ${title}${
                beatmapInfo.source
                    ? `\n${bold(
                          localization.getTranslation("beatmapSource")
                      )}: ${beatmapInfo.source}`
                    : ""
            }`
        )
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapInfo.beatmapsetID}l.jpg`)
        .setImage(
            `https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapsetID}/covers/cover.jpg`
        );

    return embed;
}

function getMatchingCharacterCount(str1: string, str2: string): number {
    let count: number = 0;

    for (let i = 0; i < Math.min(str1.length, str2.length); ++i) {
        if (str1.charAt(i).toLowerCase() === str2.charAt(i).toLowerCase()) {
            ++count;
        }
    }

    return count;
}

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
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

    const answersEmbed: EmbedBuilder = EmbedCreator.createNormalEmbed({
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

        const buttons: ButtonBuilder[] = [
            new ButtonBuilder()
                .setCustomId("answerMapTriviaArtist")
                .setStyle(ButtonStyle.Primary)
                .setLabel(localization.getTranslation("answerArtist"))
                .setEmoji(Symbols.memo),
            new ButtonBuilder()
                .setCustomId("answerMapTriviaTitle")
                .setStyle(ButtonStyle.Primary)
                .setLabel(localization.getTranslation("answerTitle"))
                .setEmoji(Symbols.memo),
        ];

        CacheManager.exemptedButtonCustomIds.add("answerMapTriviaArtist");
        CacheManager.exemptedButtonCustomIds.add("answerMapTriviaTitle");

        const component: ActionRowBuilder<ButtonBuilder> =
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

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
            (i) =>
                buttons.some(
                    (b) =>
                        (<APIButtonComponentWithCustomId>b.data).custom_id ===
                        i.customId
                ),
            (m) => {
                const row: ActionRow<MessageActionRowComponent> | undefined =
                    m.components.find((c) => c.components.length === 1);

                if (!row) {
                    return false;
                }

                return buttons.some(
                    (b) =>
                        row.components[0].customId ===
                        (<APIButtonComponentWithCustomId>b.data).custom_id
                );
            }
        );

        await new Promise<void>((resolve) => {
            collector.on("collect", async (i) => {
                i.ephemeral = true;

                const playerLocalization: TriviaLocalization =
                    new TriviaLocalization(await CommandHelper.getLocale(i));

                const answer: TriviaMapCachedAnswer | undefined =
                    answerCollection.get(i.user.id);

                const textInputBuilders: TextInputBuilder[] = [];

                switch (i.customId) {
                    case "answerMapTriviaArtist":
                        if (
                            answer?.answer.artist.toLowerCase() !==
                            beatmapInfo.artist.toLowerCase()
                        ) {
                            textInputBuilders.push(
                                new TextInputBuilder()
                                    .setCustomId("artist")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
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
                        break;
                    case "answerMapTriviaTitle":
                        if (
                            answer?.answer.title.toLowerCase() !==
                            beatmapInfo.title.toLowerCase()
                        ) {
                            textInputBuilders.push(
                                new TextInputBuilder()
                                    .setCustomId("title")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
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
                        break;
                }

                if (textInputBuilders.length === 0) {
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
                    ...textInputBuilders
                );
            });

            collector.once("end", async () => {
                const beatmapEmbed: EmbedBuilder = createEmbed(
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
                        `${BeatmapManager.showStatistics(
                            beatmapInfo,
                            1
                        )}\n${BeatmapManager.showStatistics(
                            beatmapInfo,
                            6
                        )}\n${BeatmapManager.showStatistics(beatmapInfo, 7)}`
                    )
                    .setColor(
                        BeatmapManager.getStatusColor(beatmapInfo.approved)
                    );

                const correctAnswers: Collection<
                    Snowflake,
                    TriviaMapCachedAnswer
                > = new Collection();

                for (const [, answer] of answerCollection) {
                    const playerStats: MapTriviaPlayer = statistics.get(
                        answer.user.id
                    ) ?? {
                        id: answer.user.id,
                        score: 0,
                    };

                    answer.artistMatchingCharacterCount =
                        getMatchingCharacterCount(
                            answer.answer.artist,
                            beatmapInfo.artist
                        );

                    playerStats.score +=
                        level / 10 +
                        NumberHelper.round(
                            (answer.artistMatchingCharacterCount /
                                beatmapInfo.artist.length) *
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

                    answer.titleMatchingCharacterCount =
                        getMatchingCharacterCount(
                            answer.answer.title,
                            beatmapInfo.title
                        );

                    playerStats.score +=
                        level / 10 +
                        NumberHelper.round(
                            (answer.titleMatchingCharacterCount /
                                beatmapInfo.title.length) *
                                Math.max(
                                    0,
                                    1 -
                                        (answer.titleAnswerSubmissionTime -
                                            message.createdTimestamp) /
                                            1000 /
                                            45
                                ),
                            2
                        );

                    statistics.set(answer.user.id, playerStats);

                    if (
                        answer.artistMatchingCharacterCount > 0 ||
                        answer.titleMatchingCharacterCount > 0
                    ) {
                        correctAnswers.set(answer.user.id, answer);
                    }
                }

                if (correctAnswers.size > 0) {
                    if (answersEmbed.data.fields?.length) {
                        answersEmbed.spliceFields(
                            0,
                            answersEmbed.data.fields.length
                        );
                    }

                    answersEmbed
                        .setDescription(
                            localization.getTranslation("correctAnswerGotten")
                        )
                        .addFields(
                            {
                                name: localization.getTranslation(
                                    "answerEmbedArtistGuessTitle"
                                ),
                                value:
                                    correctAnswers
                                        .filter(
                                            (v) =>
                                                v.artistMatchingCharacterCount >
                                                0
                                        )
                                        .sort(
                                            (a, b) =>
                                                b.artistMatchingCharacterCount -
                                                a.artistMatchingCharacterCount
                                        )
                                        .map(
                                            (v) =>
                                                `${
                                                    v.user.username
                                                } - ${NumberHelper.round(
                                                    (v.artistAnswerSubmissionTime -
                                                        message.createdTimestamp) /
                                                        1000,
                                                    3
                                                )} s (${
                                                    v.artistMatchingCharacterCount
                                                }/${beatmapInfo.artist.length})`
                                        )
                                        .join("\n") ||
                                    localization.getTranslation("none"),
                            },
                            {
                                name: localization.getTranslation(
                                    "answerEmbedTitleGuessTitle"
                                ),
                                value:
                                    correctAnswers
                                        .filter(
                                            (v) =>
                                                v.titleMatchingCharacterCount >
                                                0
                                        )
                                        .sort(
                                            (a, b) =>
                                                b.titleMatchingCharacterCount -
                                                a.titleMatchingCharacterCount
                                        )
                                        .map(
                                            (v) =>
                                                `${
                                                    v.user.username
                                                } - ${NumberHelper.round(
                                                    (v.titleAnswerSubmissionTime -
                                                        message.createdTimestamp) /
                                                        1000,
                                                    3
                                                )} s (${
                                                    v.titleMatchingCharacterCount
                                                }/${beatmapInfo.title.length})`
                                        )
                                        .join("\n") ||
                                    localization.getTranslation("none"),
                            }
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

    statistics.sort((a, b) => b.score - a.score);

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        color: "#037ffc",
    });

    embed
        .setTitle(localization.getTranslation("gameInfo"))
        .setDescription(
            `${bold(localization.getTranslation("starter"))}: ${
                interaction.user
            }\n` +
                `${bold(
                    localization.getTranslation("timeStarted")
                )}: ${DateTimeFormatHelper.dateToLocaleString(
                    interaction.createdAt,
                    localization.language
                )}\n` +
                `${bold(
                    localization.getTranslation("duration")
                )}: ${DateTimeFormatHelper.secondsToDHMS(
                    Math.floor(
                        (Date.now() - interaction.createdTimestamp) / 1000
                    ),
                    localization.language
                )}\n` +
                `${bold(localization.getTranslation("level"))}: ${level}`
        )
        .addFields({
            name: localization.getTranslation("leaderboard"),
            value:
                [...statistics.values()]
                    .slice(0, 10)
                    .map(
                        (v, i) =>
                            `${bold(`#${i + 1}`)}: ${userMention(
                                v.id
                            )}: ${v.score.toFixed(2)}`
                    )
                    .join("\n") || localization.getTranslation("none"),
        });

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
