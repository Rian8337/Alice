import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseMapWhitelist } from "@alice-interfaces/database/elainaDb/DatabaseMapWhitelist";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { WhitelistLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/whitelist/WhitelistLocalization";
import { Comparison } from "@alice-types/dpp/Comparison";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { GuildMember, MessageEmbed } from "discord.js";
import { Filter, Sort } from "mongodb";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: WhitelistLocalization = new WhitelistLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const query: string | null = interaction.options.getString("query");

    const mapQuery: Filter<DatabaseMapWhitelist> = {};

    const sort: Sort = {};

    const getComparisonText = (comparison: Comparison): string => {
        switch (comparison) {
            case "<":
                return "$lt";
            case "<=":
                return "$lte";
            case ">":
                return "$gt";
            case ">=":
                return "$gte";
            default:
                return "$eq";
        }
    };

    const getComparisonObject = (
        comparison: Comparison,
        value: number
    ): object => {
        return Object.defineProperty({}, getComparisonText(comparison), {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    };

    if (query) {
        let mapNameQuery: string = "";

        const comparisonRegex: RegExp = /[<=>]{1,2}/;

        const finalQueries = query.split(/\s+/g);

        for (const finalQuery of finalQueries) {
            // eslint-disable-next-line prefer-const
            let [key, value]: string[] = finalQuery.split(comparisonRegex, 2);

            const comparison: Comparison = <Comparison>(
                (comparisonRegex.exec(finalQuery) ?? ["="])[0]
            );

            switch (key) {
                case "cs":
                case "ar":
                case "od":
                case "hp":
                case "sr":
                case "bpm": {
                    const propertyName: string = `diffstat.${key}`;
                    if (mapQuery.hasOwnProperty(propertyName)) {
                        Object.defineProperty(
                            mapQuery[<keyof typeof mapQuery>propertyName],
                            getComparisonText(comparison),
                            {
                                value: parseFloat(value),
                                writable: true,
                                configurable: true,
                                enumerable: true,
                            }
                        );
                    } else {
                        Object.defineProperty(mapQuery, `diffstat.${key}`, {
                            value: getComparisonObject(
                                comparison,
                                parseFloat(value)
                            ),
                            writable: true,
                            configurable: true,
                            enumerable: true,
                        });
                    }
                    break;
                }
                case "star":
                case "stars":
                    if (mapQuery.hasOwnProperty("diffstat.sr")) {
                        Object.defineProperty(
                            mapQuery[<keyof typeof mapQuery>"diffstat.sr"],
                            getComparisonText(comparison),
                            {
                                value: parseFloat(value),
                                writable: true,
                                configurable: true,
                                enumerable: true,
                            }
                        );
                    } else {
                        Object.defineProperty(mapQuery, "diffstat.sr", {
                            value: getComparisonObject(
                                comparison,
                                parseFloat(value)
                            ),
                            writable: true,
                            configurable: true,
                            enumerable: true,
                        });
                    }
                    break;
                case "sort": {
                    const isDescendSort: boolean = value.startsWith("-");

                    if (isDescendSort) {
                        value = value.substring(1);
                    }

                    const attributes: PropertyDescriptor = {
                        value: isDescendSort ? -1 : 1,
                        writable: true,
                        configurable: true,
                        enumerable: true,
                    };

                    switch (value) {
                        case "beatmapid":
                        case "mapid":
                        case "id":
                            Object.defineProperty(sort, "mapid", attributes);
                            break;
                        case "beatmapname":
                        case "mapname":
                        case "name":
                            Object.defineProperty(sort, "mapname", attributes);
                            break;
                        case "cs":
                        case "ar":
                        case "od":
                        case "hp":
                        case "bpm":
                            Object.defineProperty(
                                sort,
                                `diffstat.${value}`,
                                attributes
                            );
                            break;
                        case "sr":
                        case "star":
                        case "stars":
                            Object.defineProperty(
                                sort,
                                "diffstat.sr",
                                attributes
                            );
                            break;
                        case "date":
                            Object.defineProperty(sort, "_id", attributes);
                            break;
                        default:
                            mapNameQuery += finalQuery + " ";
                    }
                    break;
                }
                default:
                    mapNameQuery += finalQuery + " ";
            }
        }

        if (mapNameQuery) {
            const regexQuery: RegExp[] = mapNameQuery
                .trim()
                .split(/\s+/g)
                .map((v) => {
                    return new RegExp(v, "i");
                });

            Object.defineProperty(mapQuery, "$and", {
                value: regexQuery.map((v) => {
                    return { mapname: v };
                }),
                writable: false,
                configurable: true,
                enumerable: true,
            });
        }
    }

    if (!sort.hasOwnProperty("mapname")) {
        Object.defineProperty(sort, "mapname", {
            value: 1,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }

    // Allow SR, BPM, and date sort to override beatmap title sort
    if (
        sort.hasOwnProperty("diffstat.sr") ||
        sort.hasOwnProperty("diffstat.bpm") ||
        sort.hasOwnProperty("_id")
    ) {
        delete sort["mapname"];
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const beatmapsFound: number =
        await DatabaseManager.elainaDb.collections.mapWhitelist.getWhitelistQueryResultCount(
            mapQuery
        );

    embed.setDescription(
        `**${localization.getTranslation(
            "beatmapsFound"
        )}**: ${beatmapsFound.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )}`
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const result: MapWhitelist[] =
            await DatabaseManager.elainaDb.collections.mapWhitelist.getWhitelistedBeatmaps(
                page,
                mapQuery,
                sort
            );

        for (const whitelistedBeatmap of result) {
            embed.addField(
                whitelistedBeatmap.mapname,
                `**${localization.getTranslation(
                    "download"
                )}**: [osu!](https://osu.ppy.sh/d/${
                    whitelistedBeatmap.mapid
                }) [(no video)](https://osu.ppy.sh/d/${
                    whitelistedBeatmap.mapid
                }n) - [Chimu](https://chimu.moe/en/d/${
                    whitelistedBeatmap.mapid
                }) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${
                    whitelistedBeatmap.mapid
                }) [(no video)](https://txy1.sayobot.cn/beatmaps/download/novideo/${
                    whitelistedBeatmap.mapid
                }) - [Beatconnect](https://beatconnect.io/b/${
                    whitelistedBeatmap.mapid
                }) - [Nerina](https://nerina.pw/d/${
                    whitelistedBeatmap.mapid
                })\n**CS**: ${whitelistedBeatmap.diffstat.cs} - **AR**: ${
                    whitelistedBeatmap.diffstat.ar
                } - **OD**: ${whitelistedBeatmap.diffstat.od} - **HP**: ${
                    whitelistedBeatmap.diffstat.hp
                } - **BPM**: ${whitelistedBeatmap.diffstat.bpm.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}\n**${localization.getTranslation(
                    "dateWhitelisted"
                )}**: ${DateTimeFormatHelper.dateToLocaleString(
                    whitelistedBeatmap._id!.getTimestamp(),
                    localization.language
                )}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        {
            embeds: [embed],
        },
        [interaction.user.id],
        interaction.options.getInteger("page") ?? 1,
        Math.ceil(beatmapsFound / 10),
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};