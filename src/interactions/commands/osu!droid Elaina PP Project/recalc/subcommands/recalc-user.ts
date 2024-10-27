import { Config } from "@core/Config";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { GuildMember } from "discord.js";
import { RecalculationManager } from "@utils/managers/RecalculationManager";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { RecalcLocalization } from "@localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new RecalcLocalization(
        CommandHelper.getLocale(interaction),
    );

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.hasAny(
            ...Config.verifyPerm,
        )
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

    const user = interaction.options.getUser("user", true);

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(user, {
            projection: { _id: 0, discordid: 1, hasAskedForRecalc: 1 },
        });

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.userNotBindedReject,
                ),
            ),
        });
    }

    if (await bindInfo.isDPPBanned()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsDPPBanned"),
            ),
        });
    }

    RecalculationManager.queue(interaction, bindInfo.discordid);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("userQueued"),
            user.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
