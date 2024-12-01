import { DatabaseManager } from "@database/DatabaseManager";
import { CommandCategory } from "@enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { Constants } from "@core/Constants";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ApplicationCommandOptionType } from "discord.js";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { SwitchbindLocalization } from "@localization/interactions/commands/Bot Creators/switchbind/SwitchbindLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";

export const run: SlashCommand["run"] = async (client, interaction) => {
    const localization = new SwitchbindLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        (!interaction.inCachedGuild() ||
            !interaction.member.roles.cache.has("803154670380908575"))
    ) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const uid = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit,
            true,
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: localization.getTranslation("invalidUid"),
        });
    }

    const user = await (
        await client.guilds.fetch(Constants.mainServer)
    ).members.fetch(interaction.options.getUser("user", true));

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUid(uid);

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidNotBinded"),
            ),
        });
    }

    const result = await bindInfo.moveBind(uid, user.id, localization.language);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("switchFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("switchSuccessful"),
        ),
    });
};

export const category: SlashCommand["category"] = CommandCategory.botCreators;

export const config: SlashCommand["config"] = {
    name: "switchbind",
    description:
        "Switches an osu!droid account bind from one Discord account to another.",
    options: [
        {
            name: "uid",
            required: true,
            type: ApplicationCommandOptionType.Integer,
            description: "The uid of the osu!droid account to switch.",
            minValue: Constants.uidMinLimit,
        },
        {
            name: "user",
            required: true,
            type: ApplicationCommandOptionType.User,
            description: "The user to switch the bind to.",
        },
    ],
    example: [
        {
            command: "switchbind uid:51076 user:@Rian8337#0001",
            arguments: [
                {
                    name: "uid",
                    value: 51076,
                },
                {
                    name: "user",
                    value: "@Rian8337#0001",
                },
            ],
            description:
                "will switch the osu!droid account with uid 51076's bind to Rian8337.",
        },
        {
            command: "switchbind uid:5475 user:132783516176875520",
            arguments: [
                {
                    name: "uid",
                    value: 5475,
                },
                {
                    name: "user",
                    value: "132783516176875520",
                },
            ],
            description:
                "will switch the osu!droid account with uid 5475's bind to the Discord account with ID 132783516176875520.",
        },
    ],
    permissions: ["Special"],
};
