import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { loadImage, Image } from "canvas";
import { MessageAttachment, Role } from "discord.js";
import { Precision, RequestResponse } from "@rian8337/osu-base";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const attachment: MessageAttachment | null =
        interaction.options.getAttachment("url");

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
            ),
        });
    }

    if (!clan.roleIconUnlocked) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("roleIconIsNotUnlocked")
            ),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntHaveClanRole")
            ),
        });
    }

    let icon: Buffer | null = null;

    if (attachment) {
        const req: RequestResponse = await RESTManager.request(attachment.url);

        if (req.statusCode !== 200) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("cannotDownloadRoleIcon")
                ),
            });
        }

        icon = req.data;

        let image: Image | undefined;

        try {
            image = await loadImage(icon);
        } catch {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("invalidRoleIconURL")
                ),
            });
        }

        if (Buffer.byteLength(icon) > 256e3) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("roleIconFileSizeTooBig")
                ),
            });
        }

        if (
            image.naturalHeight < 64 ||
            image.naturalHeight < 64 ||
            !Precision.almostEqualsNumber(
                image.naturalHeight / image.naturalWidth,
                1
            )
        ) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("invalidRoleIconSize")
                ),
            });
        }
    }

    await clanRole.setIcon(icon);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("changeRoleIconSuccessful")
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
