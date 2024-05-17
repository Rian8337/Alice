import { GuildMember, EmbedBuilder } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { SlashCommand } from "structures/core/SlashCommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { PingLocalization } from "@alice-localization/interactions/commands/General/ping/PingLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashCommand["run"] = async (client, interaction) => {
    const localization: PingLocalization = new PingLocalization(
        CommandHelper.getLocale(interaction),
    );

    const apiReq: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
        .setRequireAPIkey(false)
        .setEndpoint("time.php");

    await InteractionHelper.deferReply(interaction);

    const pings: [number, number, number] = await Promise.all([
        HelperFunctions.getFunctionExecutionTime(
            apiReq.sendRequest.bind(apiReq),
        ),
        HelperFunctions.getFunctionExecutionTime(
            DatabaseManager.elainaDb.instance.command.bind(
                DatabaseManager.elainaDb.instance,
            ),
            { ping: 1 },
        ),
        HelperFunctions.getFunctionExecutionTime(
            DatabaseManager.aliceDb.instance.command.bind(
                DatabaseManager.aliceDb.instance,
            ),
            { ping: 1 },
        ),
    ]);

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed.addFields(
        {
            name: localization.getTranslation("discordWs"),
            value: `${Math.abs(client.ws.ping)}ms`,
        },
        {
            name: localization.getTranslation("droidServer"),
            value: `${Math.round(pings[0])}ms`,
        },
        {
            name: localization.getTranslation("elainaDb"),
            value: `${Math.round(pings[1])}ms`,
        },
        {
            name: localization.getTranslation("aliceDb"),
            value: `${Math.round(pings[2])}ms`,
        },
    );

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("pong"),
        ),
        embeds: [embed],
    });
};

export const category: SlashCommand["category"] = CommandCategory.general;

export const config: SlashCommand["config"] = {
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
