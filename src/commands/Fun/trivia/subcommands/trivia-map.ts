import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MapTriviaPlayer } from "@alice-interfaces/trivia/MapTriviaPlayer";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import {
    Collection,
    InteractionCollector,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
    Snowflake,
} from "discord.js";
import {
    MapInfo,
    OsuAPIRequestBuilder,
    OsuAPIResponse,
    RequestResponse,
} from "@rian8337/osu-base";
import { triviaStrings } from "../triviaStrings";

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
    title: string
): MessageEmbed {
    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: "#fccf03",
    });

    embed
        .setAuthor({
            name: "Beatmap Hint",
        })
        .setTitle(`Level ${level}`)
        .setDescription(
            `**Artist:** ${artist}\n**Title**: ${title}${
                beatmapInfo.source ? `\n**Source**: ${beatmapInfo.source}` : ""
            }`
        )
        .setThumbnail(`https://b.ppy.sh/thumb/${beatmapInfo.beatmapsetID}l.jpg`)
        .setImage(
            `https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapsetID}/covers/cover.jpg`
        );

    return embed;
}

export const run: Subcommand["run"] = async (_, interaction) => {
    if (CacheManager.stillHasMapTriviaActive.has(interaction.channelId)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                triviaStrings.channelHasMapTriviaActive
            ),
        });
    }

    let level: number = 1;
    const statistics: Collection<Snowflake, MapTriviaPlayer> = new Collection();
    let beatmapCache: MapInfo[] = [];
    let hasEnded: boolean = false;

    await interaction.editReply({
        content: MessageCreator.createAccept(triviaStrings.mapTriviaStarted),
    });

    CacheManager.stillHasMapTriviaActive.add(interaction.channelId);

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
                    v.plays <= 10000000 - 200 * level ||
                    v.favorites <= 1000000 - 20 * level
            );
        }

        if (beatmapInfoIndex === -1) {
            await interaction.channel!.send({
                content: MessageCreator.createReject(
                    triviaStrings.couldNotRetrieveBeatmaps
                ),
            });

            break;
        }

        const beatmapInfo: MapInfo = beatmapCache.splice(
            beatmapInfoIndex,
            1
        )[0];

        const tempArtist = beatmapInfo.artist.replace(/\W|_/g, "");
        const tempTitle = beatmapInfo.title.replace(/\W|_/g, "");

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

        // Create guess buttons
        const buttons: MessageButton[] = [];

        for (let i = 0; i < artistGuessData.replacedStrings.length; ++i) {
            const data = artistGuessData.replacedStrings[i];

            if (buttons.find((v) => v.customId === data.char)) {
                continue;
            }

            buttons.push(
                new MessageButton()
                    .setCustomId(data.char)
                    .setLabel(data.char.toUpperCase())
                    .setStyle("PRIMARY")
            );
        }

        for (let i = 0; i < titleGuessData.replacedStrings.length; ++i) {
            const data = titleGuessData.replacedStrings[i];

            if (!buttons.find((v) => v.customId === data.char)) {
                buttons.push(
                    new MessageButton()
                        .setCustomId(data.char)
                        .setLabel(data.char.toUpperCase())
                        .setStyle("PRIMARY")
                );
            }
        }

        while (buttons.length < 25) {
            const char: string = String.fromCharCode(
                65 + Math.floor(Math.random() * 26)
            );

            if (!buttons.find((v) => v.customId === char)) {
                buttons.push(
                    new MessageButton()
                        .setCustomId(char)
                        .setLabel(char)
                        .setStyle("PRIMARY")
                );
            }
        }

        ArrayHelper.shuffle(buttons);

        // Put the first button in a random index
        const firstButton: MessageButton = buttons.shift()!;

        buttons.splice(
            Math.floor(Math.random() * buttons.length),
            0,
            firstButton
        );

        const components: MessageActionRow[] = [];

        for (let i = 0; i < Math.floor(buttons.length / 5); ++i) {
            components.push(
                new MessageActionRow().addComponents(
                    buttons.slice(5 * i, 5 + 5 * i)
                )
            );
        }

        const message: Message = await interaction.channel!.send({
            content: MessageCreator.createWarn("Guess the beatmap!"),
            embeds: [
                createEmbed(
                    level,
                    beatmapInfo,
                    artistGuessData.splittedString.join("").trim(),
                    titleGuessData.splittedString.join("").trim()
                ),
            ],
            components: components,
        });

        const collector: InteractionCollector<MessageComponentInteraction> =
            message.createMessageComponentCollector({
                time: 45000,
            });

        await new Promise<void>((resolve) => {
            collector.on("collect", async (i) => {
                const playerStats: MapTriviaPlayer = statistics.get(
                    i.user.id
                ) ?? {
                    id: i.user.id,
                    lives: 10,
                    score: 0,
                };

                if (playerStats.lives === 0) {
                    i.reply({
                        content: MessageCreator.createReject(
                            "I'm sorry, you have run out of lives to guess!"
                        ),
                        ephemeral: true,
                    });

                    return;
                }

                await i.deferUpdate();

                const char: string = i.customId;

                statistics.set(i.user.id, playerStats);

                // Disable button
                const button: MessageButton = buttons.find(
                    (b) => b.customId === char
                )!;

                button.setDisabled(true);

                const components: MessageActionRow[] = [];

                for (let i = 0; i < Math.floor(buttons.length / 5); ++i) {
                    components.push(
                        new MessageActionRow().addComponents(
                            buttons.slice(5 * i, 5 + 5 * i)
                        )
                    );
                }

                // Check if the guessed letter is in replaced strings
                const artistStringDataIndex: number =
                    artistGuessData.replacedStrings.findIndex(
                        (t) => t.char === char
                    );
                const titleStringDataIndex: number =
                    titleGuessData.replacedStrings.findIndex(
                        (t) => t.char === char
                    );

                if (
                    artistStringDataIndex === -1 &&
                    titleStringDataIndex === -1
                ) {
                    --playerStats.lives;

                    await message.edit({
                        components: components,
                    });

                    await i.followUp({
                        content: MessageCreator.createReject(
                            `${i.user.username} has guessed an incorrect character (${char})! They have ${playerStats.lives} live(s) left.`
                        ),
                    });

                    return;
                }

                // Replace guessing string with the guessed letter
                if (artistGuessData.replacedStrings.length > 0) {
                    const artistStringData =
                        artistGuessData.replacedStrings.splice(
                            artistStringDataIndex,
                            1
                        )[0];

                    for (const index of artistStringData.indexes) {
                        artistGuessData.splittedString[index] =
                            beatmapInfo.artist.charAt(index);
                    }
                }

                if (titleGuessData.replacedStrings.length > 0) {
                    const titleStringData =
                        titleGuessData.replacedStrings.splice(
                            titleStringDataIndex,
                            1
                        )[0];

                    for (const index of titleStringData.indexes) {
                        titleGuessData.splittedString[index] =
                            beatmapInfo.title.charAt(index);
                    }
                }

                playerStats.score += level / 10;

                await i.followUp({
                    content: MessageCreator.createAccept(
                        `${i.user.username} has guessed a correct character (${char})!`
                    ),
                });

                if (
                    artistGuessData.replacedStrings.length === 0 &&
                    titleGuessData.replacedStrings.length === 0
                ) {
                    // All characters have been guessed
                    collector.stop();
                } else {
                    // There are still more characters to guess left
                    await message.edit({
                        embeds: [
                            createEmbed(
                                level,
                                beatmapInfo,
                                artistGuessData.splittedString.join("").trim(),
                                titleGuessData.splittedString.join("").trim()
                            ),
                        ],
                        components: components,
                    });
                }
            });

            collector.on("end", async () => {
                const embed: MessageEmbed = createEmbed(
                    level,
                    beatmapInfo,
                    beatmapInfo.artist,
                    beatmapInfo.title
                );

                // Remove buttons from original message
                await message.edit({
                    embeds: [embed],
                    components: [],
                });

                embed
                    .setAuthor({
                        name: "Beatmap Information",
                    })
                    .setTitle(
                        `${beatmapInfo.artist} - ${beatmapInfo.title} by ${beatmapInfo.creator}`
                    )
                    .setURL(`https://osu.ppy.sh/s/${beatmapInfo.beatmapsetID}`)
                    .setDescription(
                        `${beatmapInfo.showStatistics(
                            1
                        )}\n${beatmapInfo.showStatistics(
                            4
                        )}\n${beatmapInfo.showStatistics(5)}`
                    )
                    .setColor(beatmapInfo.statusColor);

                if (
                    artistGuessData.replacedStrings.length === 0 &&
                    titleGuessData.replacedStrings.length === 0
                ) {
                    await interaction.channel!.send({
                        content: MessageCreator.createAccept(
                            `Everyone got the beatmap correct (it took ${(
                                (Date.now() - message.createdTimestamp) /
                                1000
                            ).toFixed(2)} seconds)!`
                        ),
                        embeds: [embed],
                    });

                    ++level;
                } else {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            "No one guessed the beatmap!"
                        ),
                        embeds: [embed],
                    });

                    hasEnded = true;
                }

                resolve();
            });
        });
    }

    statistics.sort((a, b) => {
        return b.score - a.score;
    });

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: "#037ffc",
    });

    embed
        .setTitle("Game Information")
        .setDescription(
            `**Starter**: ${interaction.user}\n` +
                `**Time started**: ${interaction.createdAt.toUTCString()}\n` +
                `**Duration**: ${DateTimeFormatHelper.secondsToDHMS(
                    Math.floor(
                        (Date.now() - interaction.createdTimestamp) / 1000
                    )
                )}\n` +
                `**Level**: ${level}`
        )
        .addField(
            "Leaderboard",
            [...statistics.values()]
                .slice(0, 10)
                .map(
                    (v, i) => `**#${i + 1}**: <@${v.id}>: ${v.score.toFixed(2)}`
                )
                .join("\n") || "None"
        );

    CacheManager.stillHasMapTriviaActive.delete(interaction.channelId);

    interaction.channel!.send({
        content: MessageCreator.createAccept("Game ended!"),
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
