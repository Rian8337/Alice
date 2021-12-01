import { GuildMember, MessageEmbed } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { pingStrings } from "./pingStrings";
import { DroidAPIRequestBuilder } from "osu-droid";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";

export const run: Command["run"] = async (client, interaction) => {
    const apiReq: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
        .setRequireAPIkey(false)
        .setEndpoint("time.php");

    const droidPing: number = await HelperFunctions.getFunctionExecutionTime(
        apiReq.sendRequest.bind(apiReq)
    );

    const elainaDbPing: number = await HelperFunctions.getFunctionExecutionTime(
        DatabaseManager.elainaDb.instance.command.bind(
            DatabaseManager.elainaDb.instance
        ),
        { ping: 1 }
    );

    const aliceDbPing: number = await HelperFunctions.getFunctionExecutionTime(
        DatabaseManager.aliceDb.instance.command.bind(
            DatabaseManager.aliceDb.instance
        ),
        { ping: 1 }
    );

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .addField("Discord Websocket", `${Math.abs(client.ws.ping)}ms`)
        .addField("osu!droid Server", `${Math.round(droidPing)}ms`)
        .addField("Elaina Database", `${Math.round(elainaDbPing)}ms`)
        .addField("Alice Database", `${Math.round(aliceDbPing)}ms`);

    interaction.editReply({
        content: MessageCreator.createAccept(pingStrings.pong),
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
