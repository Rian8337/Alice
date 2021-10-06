import { Constants } from "@alice-core/Constants";
import { CommandArgumentType } from "@alice-enums/core/CommandArgumentType";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { clanStrings } from "./clanStrings";

export const run: Command["run"] = async (_, interaction) => {
    if (interaction.guildId! !== Constants.mainServer) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.notInMainGuild)
        });
    }

    CommandHelper.runSubcommandOrGroup(interaction);
};

export const category: Command["category"] = CommandCategory.OSU;

export const config: Command["config"] = {
    name: "clan",
    description: "Main command for clans.",
    options: [
        {
            name: "about",
            type: CommandArgumentType.SUB_COMMAND,
            description: "About clans."
        },
        {
            name: "accept",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Accepts a user to your clan.",
            options: [
                {
                    name: "user",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The user to accept."
                }
            ]
        },
        {
            name: "announce",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Announces a message for your clan members.",
            options: [
                {
                    name: "message",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The message to announce. Must be less than 1750 characters."
                }
            ]
        },
        {
            name: "auction",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Main point of clan auctions.",
            options: [
                {
                    name: "bid",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Bids to an ongoing auction.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the auction. Must be less than 20 characters."
                        },
                        {
                            name: "amount",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The amount of Alice coins to bid."
                        }
                    ]
                },
                {
                    name: "cancel",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Cancels an auction, provided that no one has bid to it.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the auction."
                        }
                    ]
                },
                {
                    name: "create",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Creates an auction.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the auction."
                        },
                        {
                            name: "powerup",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The powerup to be auctioned."
                        },
                        {
                            name: "amount",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The amount of powerups to be auctioned."
                        },
                        {
                            name: "minimumbidamount",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The minimum bid amount for the auction."
                        },
                        {
                            name: "duration",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The duration of the auction in time format (e.g. 6:01:24:33 or 2d14h55m34s), from 1 minute to 1 day."
                        }
                    ]
                },
                {
                    name: "list",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Lists all active auctions.",
                    options: [
                        {
                            name: "page",
                            type: CommandArgumentType.INTEGER,
                            description: "The page to view. Defaults to 1."
                        }
                    ]
                },
                {
                    name: "status",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Checks the status of an auction.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the auction."
                        }
                    ]
                }
            ]
        },
        {
            name: "banner",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Modifies a clan's banner.",
            options: [
                {
                    name: "set",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Sets your clan's banner.",
                    options: [
                        {
                            name: "url",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The URL of the new clan banner."
                        }
                    ]
                },
                {
                    name: "unset",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Unsets a clan's banner.",
                    options: [
                        {
                            name: "name",
                            type: CommandArgumentType.STRING,
                            description: "The name of the clan. Defaults to your own clan."
                        }
                    ]
                }
            ]
        },
        {
            name: "cooldown",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Displays cooldown-related informations such as battle cooldown and join cooldown.",
            options: [
                {
                    name: "type",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The cooldown type.",
                    choices: [
                        {
                            name: "Battle Cooldown",
                            value: "battle"
                        },
                        {
                            name: "Joining Cooldown",
                            value: "join"
                        }
                    ]
                },
                {
                    name: "user",
                    type: CommandArgumentType.USER,
                    description: "The user to display. Defaults to yourself."
                }
            ]
        },
        {
            name: "create",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Creates a clan.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The name of the clan. Must be less than 25 characters and cannot contain unicodes."
                }
            ]
        },
        {
            name: "demote",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Demotes a clan member from co-leader.",
            options: [
                {
                    name: "member",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The clan member to demote."
                }
            ]
        },
        {
            name: "disband",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Disbands a clan.",
            options: [
                {
                    name: "name",
                    type: CommandArgumentType.STRING,
                    description: "The name of the clan. Defaults to your own clan."
                }
            ]
        },
        {
            name: "description",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Modifies a clan's description.",
            options: [
                {
                    name: "clear",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Clears the description of a clan.",
                    options: [
                        {
                            name: "clan",
                            type: CommandArgumentType.STRING,
                            description: "The name of the clan. Defaults to your own clan."
                        }
                    ]
                },
                {
                    name: "edit",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Edits the description of a clan.",
                    options: [
                        {
                            name: "description",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The new description. Must be less than 2000 characters."
                        },
                        {
                            name: "name",
                            type: CommandArgumentType.STRING,
                            description: "The name of the clan. Defaults to your own clan."
                        }
                    ]
                }
            ]
        },
        {
            name: "icon",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Modifies a clan's icon.",
            options: [
                {
                    name: "set",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Sets your clan's icon.",
                    options: [
                        {
                            name: "url",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The URL of the new clan icon."
                        }
                    ]
                },
                {
                    name: "unset",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Unsets a clan's icon.",
                    options: [
                        {
                            name: "name",
                            type: CommandArgumentType.STRING,
                            description: "The name of the clan. Defaults to your own clan."
                        }
                    ]
                }
            ]
        },
        {
            name: "info",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views the info of a clan.",
            options: [
                {
                    name: "name",
                    type: CommandArgumentType.STRING,
                    description: "The name of the clan. Defaults to your own clan, if any."
                }
            ]
        },
        {
            name: "kick",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Kicks a clan member from your clan.",
            options: [
                {
                    name: "member",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The clan member to kick."
                },
                {
                    name: "name",
                    type: CommandArgumentType.STRING,
                    description: "The name of the clan."
                }
            ]
        },
        {
            name: "leaderboard",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views the clan leaderboard.",
            options: [
                {
                    name: "page",
                    type: CommandArgumentType.INTEGER,
                    description: "The page to view. Defaults to 1."
                }
            ]
        },
        {
            name: "leave",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Leaves your current clan."
        },
        {
            name: "match",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Sets the match mode of a clan.",
            options: [
                {
                    name: "name",
                    required: true,
                    type: CommandArgumentType.STRING,
                    description: "The name of the clan."
                },
                {
                    name: "ismatchmode",
                    required: true,
                    type: CommandArgumentType.BOOLEAN,
                    description: "Whether the clan is in match mode."
                }
            ]
        },
        {
            name: "members",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views the members of a clan.",
            options: [
                {
                    name: "name",
                    type: CommandArgumentType.STRING,
                    description: "The name of the clan. Defaults to your own clan, if any."
                }
            ]
        },
        {
            name: "power",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Manages clan power.",
            options: [
                {
                    name: "give",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Gives clan power to a clan.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the clan."
                        },
                        {
                            name: "amount",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The amount of power to give."
                        }
                    ]
                },
                {
                    name: "take",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Takes clan power from a clan.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the clan."
                        },
                        {
                            name: "amount",
                            required: true,
                            type: CommandArgumentType.INTEGER,
                            description: "The amount of power to take."
                        }
                    ]
                },
                {
                    name: "transfer",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Transfers clan power from one clan to another. Used after completing a clan battle.",
                    options: [
                        {
                            name: "fromclan",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The member of the clan to transfer clan power from."
                        },
                        {
                            name: "toclan",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The member of the clan to transfer clan power to."
                        },
                        {
                            name: "challengepassed",
                            type: CommandArgumentType.BOOLEAN,
                            description: "Whether the winning clan passed the challenge given by the losing clan."
                        }
                    ]
                }
            ]
        },
        {
            name: "powerup",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Manages your clan's powerups.",
            options: [
                {
                    name: "activate",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Activates a powerup.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The name of the powerup."
                        }
                    ]
                },
                {
                    name: "activelist",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Lists your clan's active powerups."
                },
                {
                    name: "list",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Lists your clan's powerups."
                }
            ]
        },
        {
            name: "promote",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Promotes a clan member to co-leader.",
            options: [
                {
                    name: "member",
                    required: true,
                    type: CommandArgumentType.USER,
                    description: "The clan member to promote."
                }
            ]
        },
        {
            name: "role",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Manages your clan role.",
            options: [
                {
                    name: "seticon",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Sets or clears your clan role's icon.",
                    options: [
                        {
                            name: "iconurl",
                            type: CommandArgumentType.STRING,
                            description: "The URL of your new clan role icon. Omit this option to clear your clan role's icon."
                        }
                    ]
                },
                {
                    name: "setcolor",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Sets or clears your clan role's color.",
                    options: [
                        {
                            name: "color",
                            type: CommandArgumentType.STRING,
                            description: "The new color of the role. Must be a hex code. Omit this option to clear your clan role's color."
                        }
                    ]
                }
            ]
        },
        {
            name: "shop",
            type: CommandArgumentType.SUB_COMMAND_GROUP,
            description: "Main point of clan shop.",
            options: [
                {
                    name: "channel",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Buys a text channel for your clan."
                },
                {
                    name: "powerup",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Buys powerups for your clan."
                },
                {
                    name: "rename",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Renames your clan.",
                    options: [
                        {
                            name: "name",
                            required: true,
                            type: CommandArgumentType.STRING,
                            description: "The new name of your clan."
                        }
                    ]
                },
                {
                    name: "role",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Buys a custom role for your clan."
                },
                {
                    name: "rolecolor",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Unlocks the ability to change your clan role's color."
                },
                {
                    name: "roleicon",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Unlocks the ability to change your clan role's icon."
                },
                {
                    name: "special",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "A shop section specifically for special events."
                },
                {
                    name: "transferleader",
                    type: CommandArgumentType.SUB_COMMAND,
                    description: "Transfers clan leadership to a clan member.",
                    options: [
                        {
                            name: "member",
                            required: true,
                            type: CommandArgumentType.USER,
                            description: "The clan member to transfer leadership to."
                        }
                    ]
                }
            ]
        },
        {
            name: "upkeep",
            type: CommandArgumentType.SUB_COMMAND,
            description: "Views the weekly uptime pickup of your clan."
        }
    ],
    example: [],
    permissions: [],
    scope: "GUILD_CHANNEL"
};