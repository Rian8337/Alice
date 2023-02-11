import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PrototypePPCollectionManager } from "@alice-database/managers/aliceDb/PrototypePPCollectionManager";
import { PrototypePP } from "@alice-database/utils/aliceDb/PrototypePP";
import { PrototypePPEntry } from "@alice-structures/dpp/PrototypePPEntry";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import {
    bold,
    EmbedBuilder,
    GuildMember,
    Snowflake,
    userMention,
} from "discord.js";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: PPLocalization = new PPLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
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
        default:
            // If no arguments are specified, default to self
            ppInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id
            );
    }

    if (!ppInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    uid || username || discordid
                        ? "userInfoNotAvailable"
                        : "selfInfoNotAvailable"
                )
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.setDescription(
        `${bold(
            `${StringHelper.formatString(
                localization.getTranslation("ppProfileTitle"),
                userMention(ppInfo.discordid)
            )} (${ppInfo.username})`
        )}\n` +
            `${localization.getTranslation("totalPP")}: ${bold(
                `${ppInfo.pptotal.toFixed(2)} pp (#${(
                    await dbManager.getUserDPPRank(ppInfo.pptotal)
                ).toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )})`
            )}\n` +
            `${localization.getTranslation("prevTotalPP")}: ${bold(
                `${ppInfo.prevpptotal.toFixed(2)} pp`
            )}\n` +
            `Difference: ${bold(
                `${(ppInfo.pptotal - ppInfo.prevpptotal).toFixed(2)} pp`
            )}\n` +
            `[${localization.getTranslation(
                "ppProfile"
            )}](https://droidpp.osudroid.moe/prototype/profile/${
                ppInfo.uid
            })\n` +
            `${localization.getTranslation("lastUpdate")}: ${bold(
                `${DateTimeFormatHelper.dateToLocaleString(
                    new Date(ppInfo.lastUpdate),
                    localization.language
                )}`
            )}`
    );

    const entries: PrototypePPEntry[] = [...ppInfo.pp.values()];

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
            const pp: PrototypePPEntry | undefined = entries[i];

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

                embed.addFields({
                    name: `${i + 1}. ${pp.title} ${modstring}`,
                    value: `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${
                        pp.miss
                    } ❌ | ${bold(pp.prevPP.toString())} ⮕ ${bold(
                        pp.pp.toString()
                    )} pp (${(pp.pp - pp.prevPP).toFixed(2)} pp)`,
                });
            } else {
                embed.addFields({ name: `${i + 1}. -`, value: "-" });
            }
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        Math.max(interaction.options.getInteger("page") ?? 1, 1),
        Math.ceil(ppInfo.pp.size / 5),
        120,
        onPageChange
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
