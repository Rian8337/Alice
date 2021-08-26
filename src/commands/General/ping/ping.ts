import { hrtime } from "process";
import { GuildMember, MessageEmbed } from "discord.js";
import { CommandCategory } from "@alice-enums/core/CommandCategory";
import { Command } from "@alice-interfaces/core/Command";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { pingStrings } from "./pingStrings";
import { DroidAPIRequestBuilder } from "osu-droid";

export const run: Command["run"] = async (client, interaction) => {
    // TODO: split these into a function

    let start: bigint = hrtime.bigint();

    await DatabaseManager.elainaDb.instance.command({ ping: 1 });

    const elainaDbPing: number = Number((hrtime.bigint() - start) / 1000000n);

    start = hrtime.bigint();

    await DatabaseManager.aliceDb.instance.command({ ping: 1 });

    const aliceDbPing: number = Number((hrtime.bigint() - start) / 1000000n);

    const apiReq: DroidAPIRequestBuilder = new DroidAPIRequestBuilder()
        .setRequireAPIkey(false)
        .setEndpoint("time.php");

    start = hrtime.bigint();

    await apiReq.sendRequest();

    const droidPing: number = Number((hrtime.bigint() - start) / 1000000n);

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user, color: (<GuildMember | null> interaction.member)?.displayColor
    });

    embed.addField("Discord Websocket", `${Math.abs(client.ws.ping)}ms`)
        .addField("osu!droid Server", `${Math.round(droidPing)}ms`)
        .addField("Elaina Database", `${Math.round(elainaDbPing)}ms`)
        .addField("Alice Database", `${Math.round(aliceDbPing)}ms`);

    interaction.editReply({
        content: MessageCreator.createAccept(pingStrings.pong),
        embeds: [ embed ]
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
            description: "will give my websocket ping to Discord."
        }
    ],
    permissions: [],
    scope: "ALL"
};