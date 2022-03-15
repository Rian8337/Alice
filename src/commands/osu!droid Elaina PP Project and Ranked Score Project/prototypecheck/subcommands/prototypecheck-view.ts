import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePPCollectionManager } from "@alice-database/managers/aliceDb/PrototypePPCollectionManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { PrototypePPEntry } from "@alice-interfaces/dpp/PrototypePPEntry";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { GuildMember, MessageEmbed, Snowflake } from "discord.js";
import { PrototypecheckLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/prototypecheck/PrototypecheckLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Subcommand } from "@alice-interfaces/core/Subcommand";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: PrototypecheckLocalization =
        new PrototypecheckLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    const dbManager: PrototypePPCollectionManager =
        DatabaseManager.aliceDb.collections.prototypePP;

    let ppInfo: PrototypePP | null;

    switch (true) {
        case !!uid:
            ppInfo = await dbManager.getFromUid(uid!);
            break;
        case !!username:
            ppInfo = await dbManager.getFromUsername(username!);
            break;
        case !!discordid:
            ppInfo = await dbManager.getFromUser(discordid!);
            break;
        default:
            // If no arguments are specified, default to self
            ppInfo = await dbManager.getFromUser(interaction.user);
    }

    if (!ppInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation(
                    !!uid || !!username || !!discordid
                        ? "userInfoNotAvailable"
                        : "selfInfoNotAvailable"
                )
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.setDescription(
        `**${StringHelper.formatString(
            localization.getTranslation("ppProfileTitle"),
            `<@${ppInfo.discordid}>`
        )} (${ppInfo.username})**\n` +
            `${localization.getTranslation(
                "totalPP"
            )}: **${ppInfo.pptotal.toFixed(2)} pp (#${(
                await dbManager.getUserDPPRank(ppInfo.pptotal)
            ).toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )})**\n` +
            `${localization.getTranslation(
                "prevTotalPP"
            )}: **${ppInfo.prevpptotal.toFixed(2)} pp**\n` +
            `Difference: **${(ppInfo.pptotal - ppInfo.prevpptotal).toFixed(
                2
            )} pp**\n` +
            `[${localization.getTranslation(
                "ppProfile"
            )}](https://droidppboard.herokuapp.com/prototype/profile?uid=${
                ppInfo.uid
            })\n` +
            `${localization.getTranslation(
                "lastUpdate"
            )}: **${DateTimeFormatHelper.dateToLocaleString(
                new Date(ppInfo.lastUpdate),
                localization.language
            )}**`
    );

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: PrototypePPEntry[]
    ) => {
        for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
            const pp: PrototypePPEntry = contents[i];
            if (pp) {
                let modstring = pp.mods ? `+${pp.mods}` : "";
                if (
                    pp.forcedAR ||
                    (pp.speedMultiplier && pp.speedMultiplier !== 1)
                ) {
                    if (pp.mods) {
                        modstring += " ";
                    }

                    modstring += "(";

                    if (pp.forcedAR) {
                        modstring += `AR${pp.forcedAR}`;
                    }

                    if (pp.speedMultiplier && pp.speedMultiplier !== 1) {
                        if (pp.forcedAR) {
                            modstring += ", ";
                        }

                        modstring += `${pp.speedMultiplier}x`;
                    }

                    modstring += ")";
                }

                embed.addField(
                    `${i + 1}. ${pp.title} ${modstring}`,
                    `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${
                        pp.miss
                    } ❌ | **${pp.prevPP}** ⮕ **${pp.pp}** pp (${(
                        pp.pp - pp.prevPP
                    ).toFixed(2)} pp)`
                );
            } else {
                embed.addField(`${i + 1}. -`, "-");
            }
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        [...ppInfo.pp.values()],
        5,
        NumberHelper.clamp(
            interaction.options.getInteger("page") ?? 1,
            1,
            Math.ceil(ppInfo.pp.size / 5)
        ),
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
