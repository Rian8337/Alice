import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { RESTManager } from "@alice-utils/managers/RESTManager";
import { loadImage, Image } from "canvas";
import { Role } from "discord.js";
import { Precision, RequestResponse } from "@rian8337/osu-base";

export const run: Subcommand["run"] = async (_, interaction) => {
    const iconURL: string | null = interaction.options.getString("url");

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (!clan.roleIconUnlocked) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.roleIconIsNotUnlocked
            ),
        });
    }

    if (!clan.hasAdministrativePower(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanDoesntHaveClanRole
            ),
        });
    }

    let icon: Buffer | null = null;

    if (iconURL) {
        const req: RequestResponse = await RESTManager.request(iconURL);

        if (req.statusCode !== 200) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    clanStrings.cannotDownloadRoleIcon
                ),
            });
        }

        icon = req.data;

        let image: Image | undefined;

        try {
            image = await loadImage(icon);
        } catch {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    clanStrings.invalidRoleIconURL
                ),
            });
        }

        if (Buffer.byteLength(icon) > 256e3) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    clanStrings.roleIconFileSizeTooBig
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
            return interaction.editReply({
                content: MessageCreator.createReject(
                    clanStrings.invalidRoleIconSize
                ),
            });
        }
    }

    await clanRole.setIcon(icon);

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.changeRoleIconSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
