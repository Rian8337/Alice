import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { DatabaseUserBind } from "structures/database/elainaDb/DatabaseUserBind";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { PPLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/pp/PPLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Snowflake } from "discord.js";
import { FindOptions } from "mongodb";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

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

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    const findOptions: FindOptions<DatabaseUserBind> = {
        projection: {
            _id: 0,
            "pp.hash": 1,
            "pp.pp": 1,
            pptotal: 1,
            username: 1,
        },
    };

    switch (true) {
        case !!uid:
            bindInfo = await dbManager.getFromUid(uid!, findOptions);

            break;
        case !!username:
            bindInfo = await dbManager.getFromUsername(username!, findOptions);

            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                findOptions
            );
    }

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    uid || username || discordid
                        ? Constants.userNotBindedReject
                        : Constants.selfNotBindedReject
                )
            ),
        });
    }

    const ppValue: number = interaction.options.getNumber("pp", true);

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    // Since <Collection>.at will spread the collection anyway, we search the index here.
    let playIndex: number = 0;

    for (const pp of bindInfo.pp.values()) {
        if (pp.pp <= ppValue) {
            break;
        }

        ++playIndex;
    }

    // Maximum plays is 75, so if the insertion index is 75, it means the pp value is too low.
    if (playIndex === 75) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("whatIfScoreNotEntered"),
                NumberHelper.round(ppValue, 2).toLocaleString(BCP47),
                bindInfo.username
            ),
        });
    }

    // Mock the PP entry.
    DPPHelper.insertScore(bindInfo.pp, [
        {
            accuracy: 100,
            combo: 0,
            hash: "",
            miss: 0,
            mods: "",
            pp: ppValue,
            scoreID: 0,
            title: "",
        },
    ]);

    const totalPP: number = DPPHelper.calculateFinalPerformancePoints(
        bindInfo.pp
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("whatIfScoreEntered"),
            NumberHelper.round(ppValue, 2).toLocaleString(BCP47),
            NumberHelper.round(
                ppValue * Math.pow(0.95, playIndex),
                2
            ).toLocaleString(BCP47),
            bindInfo.username,
            (playIndex + 1).toLocaleString(BCP47),
            NumberHelper.round(totalPP, 2).toLocaleString(BCP47),
            NumberHelper.round(totalPP - bindInfo.pptotal, 2).toLocaleString(
                BCP47
            )
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 3,
};
