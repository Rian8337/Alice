import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { MessageEmbed, Snowflake } from "discord.js";
import { ppcheckStrings } from "./ppcheckStrings";

export const run: Command["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined = interaction.options.getUser("user")?.id;
    let uid: number | undefined | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(ppcheckStrings.tooManyOptions)
        });
    }

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null;

    switch (true) {
        case !!uid:
            bindInfo = await dbManager.getFromUid(uid!);
            break;
        case !!username:
            bindInfo = await dbManager.getFromUsername(username!);
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);
    }

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                !!uid || !!username || !!discordid ? Constants.userNotBindedReject : Constants.selfNotBindedReject
            )
        });
    }

    const ppRank: number = await DatabaseManager.elainaDb.collections.userBind.getUserDPPRank(bindInfo.pptotal);

    const embed: MessageEmbed = await EmbedCreator.createDPPListEmbed(interaction, bindInfo, ppRank);

    const onPageChange: OnButtonPageChange = async (_, page, contents: PPEntry[]) => {
        for (let i = 5 * (page - 1); i < 5 + 5 * (page - 1); ++i) {
            const pp: PPEntry = contents[i];
            if (pp) {
                let modstring = pp.mods ? `+${pp.mods}` : "";
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

                embed.addField(`${i+1}. ${pp.title} ${modstring}`, `${pp.combo}x | ${pp.accuracy.toFixed(2)}% | ${pp.miss} ❌ | __${pp.pp} pp__ (Net pp: ${(pp.pp * Math.pow(0.95, i)).toFixed(2)} pp)`);
            } else {
                embed.addField(`${i+1}. -`, "-");
            }
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [ embed ] },
        [interaction.user.id],
        [...bindInfo.pp.values()],
        5,
        NumberHelper.clamp(
            interaction.options.getInteger("page") ?? 1,
            1,
            Math.ceil(bindInfo.pp.size / 5)
        ),
        120,
        onPageChange
    );
};

export const category: Command["category"] = CommandCategory.PP_AND_RANKED;

export const config: Command["config"] = {
    name: "ppcheck",
    description: "Checks yours or a player's droid pp (dpp) profile.",
    options: [
        {
            name: "user",
            type: ApplicationCommandOptionTypes.USER,
            description: "The user to check."
        },
        {
            name: "uid",
            type: ApplicationCommandOptionTypes.INTEGER,
            description: "The uid of the player."
        },
        {
            name: "username",
            type: ApplicationCommandOptionTypes.STRING,
            description: "The username of the player."
        },
        {
            name: "page",
            type: ApplicationCommandOptionTypes.INTEGER,
            description: "The page to view, ranging from 1 to 15. Maximum page can be less than 15. Defaults to 1."
        }
    ],
    example: [
        {
            command: "ppcheck",
            description: "will give a list of your submitted plays in droid pp system."
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "user",
                    value: "@Rian8337#0001"
                },
                {
                    name: "page",
                    value: 5
                }
            ],
            description: "will give a list of Rian8337's submitted plays in droid pp system at page 5."
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "user",
                    value: "132783516176875520"
                }
            ],
            description: "will give a list of the user with that Discord ID's submitted plays in droid pp system."
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "username",
                    value: "dgsrz"
                },
                {
                    name: "page",
                    value: 7
                }
            ],
            description: "will give a list of that username's submitted plays in droid pp system at page 7."
        },
        {
            command: "ppcheck",
            arguments: [
                {
                    name: "uid",
                    value: 11678
                }
            ],
            description: "will give a list of that uid's submitted plays in droid pp system."
        }
    ],
    cooldown: 10,
    permissions: [],
    scope: "ALL"
};