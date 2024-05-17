import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "structures/core/EventUtil";
import { DatabaseBirthday } from "structures/database/aliceDb/DatabaseBirthday";
import { BirthdayTrackingLocalization } from "@alice-localization/events/ready/birthdayTracking/BirthdayTrackingLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { consola } from "consola";

export const run: EventUtil["run"] = async (client) => {
    const interval = setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("birthdayTracking")
        ) {
            return;
        }

        const guild = await client.guilds.fetch(Constants.mainServer);

        const role = guild.roles.cache.get("695201338182860860");

        if (!role) {
            clearInterval(interval);
            return;
        }

        const queryDate = new Date();

        const birthdays =
            await DatabaseManager.aliceDb.collections.birthday.get(
                "discordid",
                {
                    $and: [
                        {
                            date: {
                                $gte: queryDate.getUTCDate() - 1,
                                $lte: queryDate.getUTCDate() + 1,
                            },
                        },
                        {
                            month: {
                                $gte: queryDate.getUTCMonth() - 1,
                                $lte: queryDate.getUTCMonth() + 1,
                            },
                        },
                    ],
                },
            );

        const validBirthdays: DatabaseBirthday[] = [];

        for (let timezone = -12; timezone < 15; ++timezone) {
            const d = new Date();

            // Check if it's leap year and if it is check if current date is 29 Feb
            if (
                d.getUTCFullYear() % 4 === 0 &&
                d.getUTCMonth() === 1 &&
                d.getUTCDate() === 29
            ) {
                d.setUTCDate(1);
                d.setUTCMonth(2);
            }

            d.setUTCHours(d.getUTCHours() + timezone);

            const timezoneEntries = birthdays.filter(
                (v) => v.timezone === timezone,
            );

            for (const timezoneEntry of timezoneEntries.values()) {
                if (
                    timezoneEntry.date === d.getUTCDate() &&
                    timezoneEntry.month === d.getUTCMonth()
                ) {
                    validBirthdays.push(timezoneEntry);
                }
            }
        }

        // Clear outdated birthday roles
        for (const member of role.members.values()) {
            if (!validBirthdays.find((v) => v.discordid === member.id)) {
                await member.roles.remove(role, "Not birthday anymore");
            }
        }

        for (const birthday of validBirthdays) {
            const user = await guild.members
                .fetch(birthday.discordid)
                .catch(() => null);

            if (!user) {
                continue;
            }

            if (user.roles.cache.has(role.id)) {
                continue;
            }

            await user.roles.add(role, "Happy birthday!");

            if (user.user.bot) {
                continue;
            }

            // Give coins as gift
            await user
                .send(
                    MessageCreator.createPrefixedMessage(
                        new BirthdayTrackingLocalization(
                            CommandHelper.getLocale(user.id),
                        ).getTranslation("happyBirthday"),
                        Symbols.cake,
                    ),
                )
                .catch(consola.error);

            await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
                { discordid: user.id },
                { $inc: { alicecoins: 1000 } },
            );
        }
    }, 20 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for tracking birthday.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
