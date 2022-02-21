import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { RecalcLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/RecalcLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { RecalculationManager } from "@alice-utils/managers/RecalculationManager";
import { Snowflake } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: RecalcLocalization = new RecalcLocalization(language);

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("tooManyOptions")),
        });
    }

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

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
                new ConstantsLocalization(language).getTranslation(!!uid || !!username || !!discordid
                    ? Constants.userNotBindedReject
                    : Constants.selfNotBindedReject)
            ),
        });
    }

    if (await bindInfo.isDPPBanned()) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("userIsDPPBanned")),
        });
    }

    RecalculationManager.queuePrototype(interaction, bindInfo.discordid);

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("userQueued"),
            `uid ${bindInfo.uid}`
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
