import { GuildMember, MessageEmbed } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { PingLocalization } from "@alice-localization/commands/General/PingLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Command["run"] = async (client, interaction) => {
    const localization: PingLocalization = new PingLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const apiReq: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
        .setRequireAPIkey(false)
        .setEndpoint("time.php");

    const pings: [number, number, number] = await Promise.all([
        HelperFunctions.getFunctionExecutionTime(
            apiReq.sendRequest.bind(apiReq)
        ),
        HelperFunctions.getFunctionExecutionTime(
            DatabaseManager.elainaDb.instance.command.bind(
                DatabaseManager.elainaDb.instance
            ),
            { ping: 1 }
        ),
        HelperFunctions.getFunctionExecutionTime(
            DatabaseManager.aliceDb.instance.command.bind(
                DatabaseManager.aliceDb.instance
            ),
            { ping: 1 }
        ),
    ]);

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .addField(
            localization.getTranslation("discordWs"),
            `${Math.abs(client.ws.ping)}ms`
        )
        .addField(
            localization.getTranslation("droidServer"),
            `${Math.round(pings[0])}ms`
        )
        .addField(
            localization.getTranslation("elainaDb"),
            `${Math.round(pings[1])}ms`
        )
        .addField(
            localization.getTranslation("aliceDb"),
            `${Math.round(pings[2])}ms`
        );

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("pong")
        ),
        embeds: [embed],
    });
};

export const category: Command["category"] = CommandCategory.GENERAL;

export const config: Command["config"] = {
    name: "ping",
    description: "Pong!",
    options: [],
    example: [
        {
            command: "ping",
            description: "will give my websocket ping to Discord.",
        },
    ],
    permissions: [],
    scope: "ALL",
};
