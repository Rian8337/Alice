import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { GuildMember, User } from "discord.js";
import { RecalculationManager } from "@alice-utils/managers/RecalculationManager";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { RecalcLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project and Ranked Score Project/recalc/RecalcLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (_, interaction) => {
    const localization: RecalcLocalization = new RecalcLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        !(<GuildMember>interaction.member).roles.cache.hasAny(
            ...Config.verifyPerm
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.noPermissionReject
                )
            ),
        });
    }

    const user: User = interaction.options.getUser("user", true);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(Constants.userNotBindedReject),
        });
    }

    if (bindInfo.hasAskedForRecalc) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userHasRequestedRecalc")
            ),
        });
    }

    if (await bindInfo.isDPPBanned()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userIsDPPBanned")
            ),
        });
    }

    RecalculationManager.queue(interaction, bindInfo.discordid);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("userQueued"),
            user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["SPECIAL"],
};
