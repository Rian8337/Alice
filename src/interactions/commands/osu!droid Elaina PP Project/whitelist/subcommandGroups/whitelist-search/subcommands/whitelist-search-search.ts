import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DatabaseMapWhitelist } from "structures/database/elainaDb/DatabaseMapWhitelist";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { WhitelistLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/whitelist/WhitelistLocalization";
import { Comparison } from "structures/dpp/Comparison";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { bold, EmbedBuilder, GuildMember, hyperlink } from "discord.js";
import { Filter, Sort } from "mongodb";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
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

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const beatmapsFound: number =
        await DatabaseManager.elainaDb.collections.mapWhitelist.getWhitelistQueryResultCount(
            mapQuery
        );

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    embed.setDescription(
        `${bold(
            localization.getTranslation("beatmapsFound")
        )}: ${beatmapsFound.toLocaleString(BCP47)}`
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const result: MapWhitelist[] =
            await DatabaseManager.elainaDb.collections.mapWhitelist.getWhitelistedBeatmaps(
                page,
                mapQuery,
                sort
            );

        embed.addFields(
            result.map((v) => {
                return {
                    name: v.mapname,
                    value: `${bold(
                        localization.getTranslation("download")
                    )}: ${hyperlink(
                        "osu!",
                        `https://osu.ppy.sh/d/${v.mapid}`
                    )} ${hyperlink(
                        "(no video)",
                        `https://osu.ppy.sh/d/${v.mapid}n`
                    )} - ${hyperlink(
                        "Chimu",
                        `https://chimu.moe/en/d/${v.mapid}`
                    )} - ${hyperlink(
                        "Sayobot",
                        `https://txy1.sayobot.cn/beatmaps/download/full/${v.mapid}`
                    )} ${hyperlink(
                        "(no video)",
                        `https://txy1.sayobot.cn/beatmaps/download/novideo/${v.mapid}`
                    )} - ${hyperlink(
                        "Beatconnect",
                        `https://beatconnect.io/b/${v.mapid}/`
                    )} - ${hyperlink(
                        "Nerina",
                        `https://nerina.pw/d/${v.mapid}`
                    )}\n${bold("CS")}: ${v.diffstat.cs} - ${bold("AR")}: ${
                        v.diffstat.ar
                    } - ${bold("OD")}: ${v.diffstat.od} - ${bold("HP")}: ${
                        v.diffstat.hp
                    } - ${bold("BPM")}: ${v.diffstat.bpm.toLocaleString(
                        BCP47
                    )}\n${bold(
                        localization.getTranslation("dateWhitelisted")
                    )}: ${DateTimeFormatHelper.dateToLocaleString(
                        v._id!.getTimestamp(),
                        localization.language
                    )}`,
                };
            })
        );
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

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
