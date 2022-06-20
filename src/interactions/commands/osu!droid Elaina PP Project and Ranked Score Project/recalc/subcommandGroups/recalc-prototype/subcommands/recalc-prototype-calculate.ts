import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { RecalcLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project and Ranked Score Project/recalc/RecalcLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { RecalculationManager } from "@alice-utils/managers/RecalculationManager";
import { Snowflake } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: RecalcLocalization = new RecalcLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null;

    switch (true) {
        case !!uid:
            bindInfo = await dbManager.getFromUid(uid!, {
                retrieveAllPlays: true,
            });
            break;
        case !!username:
            bindInfo = await dbManager.getFromUsername(username!, {
                retrieveAllPlays: true,
            });
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!, {
                retrieveAllPlays: true,
            });
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user, {
                retrieveAllPlays: true,
            });
    }

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    !!uid || !!username || !!discordid
                        ? Constants.userNotBindedReject
                        : Constants.selfNotBindedReject
                )
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

    RecalculationManager.queuePrototype(interaction, bindInfo.discordid);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("userQueued"),
            `uid ${bindInfo.uid}`
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
