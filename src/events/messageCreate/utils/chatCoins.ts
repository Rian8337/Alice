import { DMChannel, Message, Snowflake, TextChannel } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";

const coinCooldown: Set<Snowflake> = new Set();

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.channel instanceof DMChannel || message.author.bot) {
        return;
    }

    if (message.guild?.id !== Constants.mainServer) {
        return;
    }

    if ([
        '360714803691388928',
        '415559968062963712',
        '360715303149240321',
        '360715871187894273',
        '360715992621514752'
    ].includes(<string> (<TextChannel> message.channel).parentId)) {
        return;
    }

    if ([
        '326152555392532481',
        '361785436982476800',
        '316863464888991745',
        '549109230284701718',
        '468042874202750976',
        '430002296160649229',
        '430939277720027136',
        '696663321633357844'
    ].includes(message.channel.id)) {
        return;
    }

    if (coinCooldown.has(message.author.id)) {
        return;
    }

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(message.author);

    if (!playerInfo) {
        return;
    }

    await playerInfo.incrementCoins(1);
};

export const config: EventUtil["config"] = {
    description: "Responsible for tracking Alice coins cooldown for users' chat activities.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};