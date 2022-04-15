import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Symbols } from "@alice-enums/utils/Symbols";
import { Command } from "@alice-interfaces/core/Command";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { Language } from "@alice-localization/base/Language";
import {
    PPcompareLocalization,
    PPcompareStrings,
} from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/ppcompare/PPcompareLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Collection, GuildMember, MessageEmbed, User } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export const run: Command["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: PPcompareLocalization = new PPcompareLocalization(
        language
    );

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;
    const subcommand: string = interaction.options.getSubcommand();

    const uidToCompare: number | null =
        interaction.options.getInteger("uidtocompare");
    const userToCompare: User | null =
        interaction.options.getUser("usertocompare");
    const usernameToCompare: string | null =
        interaction.options.getString("usernametocompare");

    const otherUid: number | null = interaction.options.getInteger("otheruid");
    const otherUser: User | null = interaction.options.getUser("otheruser");
    const otherUsername: string | null =
        interaction.options.getString("otherusername");

    let firstBindInfo: UserBind | null = null;
    let secondBindInfo: UserBind | null = null;

    switch (subcommand) {
        case "uid":
            if (uidToCompare === otherUid) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("cannotCompareSamePlayers")
                    ),
                });
            }

            firstBindInfo = await dbManager.getFromUid(uidToCompare!);

            secondBindInfo = otherUid
                ? await dbManager.getFromUid(otherUid)
                : await dbManager.getFromUser(interaction.user);
            break;
        case "user":
            if (userToCompare!.id === (otherUser ?? interaction.user).id) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("cannotCompareSamePlayers")
                    ),
                });
            }

            firstBindInfo = await dbManager.getFromUser(userToCompare!);

            secondBindInfo = await dbManager.getFromUser(
                otherUser ?? interaction.user
            );
            break;
        case "username":
            if (usernameToCompare === otherUsername) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("cannotCompareSamePlayers")
                    ),
                });
            }

            firstBindInfo = await dbManager.getFromUsername(usernameToCompare!);

            secondBindInfo = otherUsername
                ? await dbManager.getFromUsername(otherUsername)
                : await dbManager.getFromUser(interaction.user);
            break;
    }

    if (!firstBindInfo || !secondBindInfo) {
        if (!secondBindInfo && !otherUid && !otherUser && !otherUsername) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    new ConstantsLocalization(language).getTranslation(
                        Constants.selfNotBindedReject
                    )
                ),
            });
        }

        let comparedRejectValue: string = "";

        switch (subcommand) {
            case "uid":
                comparedRejectValue = (
                    !secondBindInfo ? otherUid : uidToCompare
                )!.toString();
                break;
            case "user":
                comparedRejectValue = (
                    !secondBindInfo ? otherUser : userToCompare
                )!.tag;
                break;
            case "username":
                comparedRejectValue = (
                    !secondBindInfo ? otherUsername : usernameToCompare
                )!;
                break;
        }

        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("playerNotBinded"),
                localization.getTranslation(<keyof PPcompareStrings>subcommand),
                comparedRejectValue
            ),
        });
    }

    const firstPlayerPP: Collection<string, PPEntry> = firstBindInfo.pp;
    const secondPlayerPP: Collection<string, PPEntry> = secondBindInfo.pp;
    const ppToCompare: Collection<string, PPEntry> =
        firstPlayerPP.intersect(secondPlayerPP);

    if (ppToCompare.size === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noSimilarPlayFound")
            ),
        });
    }

    const firstPlayerPPRank: number = await dbManager.getUserDPPRank(
        firstBindInfo.pptotal
    );
    const secondPlayerPPRank: number = await dbManager.getUserDPPRank(
        secondBindInfo.pptotal
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    let ppDescription: string = "";

    if (firstBindInfo.pptotal < secondBindInfo.pptotal) {
        ppDescription = `**${firstBindInfo.pptotal.toFixed(
            2
        )}pp (#${firstPlayerPPRank.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )})** vs **${Symbols.crown} ${secondBindInfo.pptotal.toFixed(
            2
        )}pp (#${secondPlayerPPRank.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )})**`;
    } else if (firstBindInfo.pptotal > secondBindInfo.pptotal) {
        ppDescription = `**${Symbols.crown} ${firstBindInfo.pptotal.toFixed(
            2
        )}pp (#${firstPlayerPPRank.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )})** vs **${secondBindInfo.pptotal.toFixed(
            2
        )}pp (#${secondPlayerPPRank.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )})**`;
    } else {
        ppDescription = `**${firstBindInfo.pptotal.toFixed(
            2
        )}pp (#${firstPlayerPPRank.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )})** vs **${secondBindInfo.pptotal.toFixed(
            2
        )}pp (#${secondPlayerPPRank.toLocaleString(
            LocaleHelper.convertToBCP47(localization.language)
        )})**`;
    }

    embed
        .setTitle(localization.getTranslation("topPlaysComparison"))
        .setDescription(
            `${localization.getTranslation("player")}: **${
                firstBindInfo.username
            }** vs **${secondBindInfo.username}**\n` +
                `${localization.getTranslation("totalPP")}: ${ppDescription}`
        );

    const getModString = (pp: PPEntry): string => {
        let modstring = pp.mods ? `+${pp.mods}` : "+No Mod";

        if (pp.forcedAR || (pp.speedMultiplier && pp.speedMultiplier !== 1)) {
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

        return modstring;
    };

    const onPageChange: OnButtonPageChange = async (_, page) => {
        for (
            let i = 5 * (page - 1);
            i < Math.min(ppToCompare.size, 5 + 5 * (page - 1));
            ++i
        ) {
            const key: string = ppToCompare.keyAt(i)!;

            const firstPP: PPEntry = firstPlayerPP.get(key)!;
            const secondPP: PPEntry = secondPlayerPP.get(key)!;

            let firstPlayerDescription: string = `${
                firstPP.combo
            }x | ${firstPP.accuracy.toFixed(2)}% | ${firstPP.miss} ${
                Symbols.missIcon
            } | ${firstPP.pp}pp (${getModString(firstPP)})`;
            let secondPlayerDescription: string = `${
                secondPP.combo
            }x | ${secondPP.accuracy.toFixed(2)}% | ${secondPP.miss} ${
                Symbols.missIcon
            } | ${secondPP.pp}pp (${getModString(secondPP)})`;

            if (firstPP.pp < secondPP.pp) {
                secondPlayerDescription = `**${secondPlayerDescription}** ${Symbols.crown}`;
            } else if (firstPP.pp > secondPP.pp) {
                firstPlayerDescription = `**${firstPlayerDescription}** ${Symbols.crown}`;
            }

            embed.addField(
                `${i + 1}. ${firstPP.title}`,
                `**${firstBindInfo!.username}**: ${firstPlayerDescription}\n` +
                    `**${
                        secondBindInfo!.username
                    }**: ${secondPlayerDescription}`
            );
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(ppToCompare.size / 5),
        120,
        onPageChange
    );
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "ppcompare",
    description:
        "Compares yours or a player's droid pp (dpp) profile with another player's droid pp (dpp) profile.",
    options: [
        {
            name: "uid",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Compares two players' droid pp (dpp) profile using their uid.",
            options: [
                {
                    name: "uidtocompare",
                    required: true,
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description: "The uid to compare against.",
                },
                {
                    name: "otheruid",
                    type: ApplicationCommandOptionTypes.INTEGER,
                    description:
                        "The other uid to compare against. If unspecified, defaults to yourself.",
                },
            ],
        },
        {
            name: "user",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Compares two players' droid pp (dpp) profile using their binded Discord account.",
            options: [
                {
                    name: "usertocompare",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER,
                    description: "The Discord user to compare against.",
                },
                {
                    name: "otheruser",
                    type: ApplicationCommandOptionTypes.USER,
                    description:
                        "The other Discord user to compare against. If unspecified, defaults to yourself.",
                },
            ],
        },
        {
            name: "username",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            description:
                "Compares two players' droid pp (dpp) profile using their username.",
            options: [
                {
                    name: "usernametocompare",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "The username to compare against.",
                },
                {
                    name: "otherusername",
                    type: ApplicationCommandOptionTypes.STRING,
                    description:
                        "The other username to compare against. If unspecified, defaults to yourself.",
                },
            ],
        },
    ],
    example: [],
    cooldown: 5,
    permissions: [],
    scope: "ALL",
};
