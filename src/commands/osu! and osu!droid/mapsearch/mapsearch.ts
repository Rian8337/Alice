import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Command } from "@alice-interfaces/core/Command";
import { SayobotAPIResponse } from "@alice-interfaces/sayobot/SayobotAPIResponse";
import { SayobotBeatmap } from "@alice-interfaces/sayobot/SayobotBeatmap";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { rankedStatus, RequestResponse } from "@rian8337/osu-base";
import { MapsearchLocalization } from "@alice-localization/commands/osu! and osu!droid/MapsearchLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (_, interaction) => {
    const localization: MapsearchLocalization = new MapsearchLocalization(
        await CommandHelper.getLocale(interaction)
    );

    // Documentation: https://docs.qq.com/doc/DS0lDWndpc0FlVU5B.
    // Defaults to std, type "search for", limit at 100 beatmaps.
    let url: string = "https://api.sayobot.cn/beatmaplist?T=4&L=100&M=1";

    if (interaction.options.getString("keyword")) {
        url += `&K=${encodeURIComponent(
            interaction.options.getString("keyword", true)
        )}`;
    }

    if (
        interaction.options.data.filter((v) => v.name !== "keyword").length > 0
    ) {
        const getInputRange = (mainstr: string): string => {
            return `${interaction.options.getNumber(`min${mainstr}`) ?? 0}~${
                interaction.options.getNumber(`max${mainstr}`) ?? ""
            }`;
        };

        url +=
            '&R="' +
            `star:${getInputRange("stars")},` +
            `AR:${getInputRange("ar")},` +
            `OD:${getInputRange("od")},` +
            `HP:${getInputRange("hp")},` +
            `length:${DateTimeFormatHelper.DHMStoSeconds(
                interaction.options.getString("minduration") ?? "0"
            )}~${
                DateTimeFormatHelper.DHMStoSeconds(
                    interaction.options.getString("minduration") ?? ""
                ) || ""
            },` +
            `BPM:${getInputRange("bpm")}` +
            'end"';
    }

    const result: RequestResponse = await RESTManager.request(url);

    if (result.statusCode !== 200) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("requestFailed")
            ),
        });
    }

    const data: SayobotAPIResponse = JSON.parse(result.data.toString("utf-8"));

    const beatmaps: SayobotBeatmap[] = data.data ?? [];

    if (beatmaps.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noBeatmapsFound")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
        footerText: localization.getTranslation("serviceProvider"),
    });

    embed.setDescription(
        `**${localization.getTranslation(
            "beatmapsFound"
        )}**: ${data.results.toLocaleString()}`
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        embed.spliceFields(0, embed.fields.length);

        for (
            let i = 5 * (page - 1);
            i < Math.min(beatmaps.length, 5 + 5 * (page - 1));
            ++i
        ) {
            const d: SayobotBeatmap = beatmaps[i];

            let status: string = "Unknown";

            for (const stat in rankedStatus) {
                if (parseInt(stat) === d.approved) {
                    status =
                        rankedStatus[stat] !== "WIP"
                            ? StringHelper.capitalizeString(
                                  rankedStatus[stat],
                                  true
                              )
                            : rankedStatus[stat];
                    break;
                }
            }

            embed.addField(
                `${i + 1}. ${d.artist} - ${d.title} (${d.creator})`,
                `**${localization.getTranslation(
                    "download"
                )}**: [osu!](https://osu.ppy.sh/d/${
                    d.sid
                }) [(no video)](https://osu.ppy.sh/d/${
                    d.sid
                }n) - [Chimu](https://chimu.moe/en/d/${
                    d.sid
                }) - [Sayobot](https://txy1.sayobot.cn/beatmaps/download/full/${
                    d.sid
                }) [(no video)](https://txy1.sayobot.cn/beatmaps/download/novideo/${
                    d.sid
                }) - [Beatconnect](https://beatconnect.io/b/${
                    d.sid
                }/) - [Nerina](https://nerina.pw/d/${d.sid})${
                    d.approved >= rankedStatus.RANKED &&
                    d.approved !== rankedStatus.QUALIFIED
                        ? ` - [Ripple](https://storage.ripple.moe/d/${d.sid})`
                        : ""
                }\n**${localization.getTranslation(
                    "lastUpdate"
                )}**: ${DateTimeFormatHelper.dateToLocaleString(
                    new Date(d.lastupdate * 1000),
                    localization.language
                )} | **${status}**\n${
                    Symbols.heart
                } **${d.favourite_count.toLocaleString()}** - ${
                    Symbols.playButton
                } **${d.play_count.toLocaleString()}**`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        beatmaps,
        5,
        1,
        120,
        onPageChange
    );
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "mapsearch",
    description: "Searches for beatmaps. Service provided by Sayobot.",
    options: [
        {
            name: "keyword",
            type: ApplicationCommandOptionTypes.STRING,
            description: "The keyword to search for.",
        },
        {
            name: "minstars",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum star rating to search for.",
        },
        {
            name: "maxstars",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum star rating to search for.",
        },
        {
            name: "mincs",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum CS (Circle Size) to search for.",
        },
        {
            name: "maxcs",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum CS (Circle Size) to search for.",
        },
        {
            name: "minar",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum AR (Approach Rate) to search for.",
        },
        {
            name: "maxar",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum AR (Approach Rate) to search for.",
        },
        {
            name: "minod",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum OD (Overall Difficulty) to search for.",
        },
        {
            name: "maxod",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum OD (Overall Difficulty) to search for.",
        },
        {
            name: "minhp",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum HP (health drain rate) to search for.",
        },
        {
            name: "maxhp",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum HP (health drain rate) to search for.",
        },
        {
            name: "minduration",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The minimum duration to search for, in time format (e.g. 6:01:24:33 or 2d14h55m34s).",
        },
        {
            name: "maxduration",
            type: ApplicationCommandOptionTypes.STRING,
            description:
                "The maximum duration to search for, in time format (e.g. 6:01:24:33 or 2d14h55m34s).",
        },
        {
            name: "minbpm",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The minimum BPM to search for.",
        },
        {
            name: "maxbpm",
            type: ApplicationCommandOptionTypes.NUMBER,
            description: "The maximum BPM to search for.",
        },
    ],
    example: [],
    permissions: [],
    cooldown: 15,
    scope: "ALL",
};
