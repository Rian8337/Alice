import { readFile } from "fs/promises";
import { Constants } from "@alice-core/Constants";
import { VerifyLanguage } from "@alice-enums/events/VerifyLanguage";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { TimeoutManager } from "@alice-utils/managers/TimeoutManager";
import {
    Collection,
    Guild,
    GuildMember,
    Message,
    MessageComponentInteraction,
    MessageEmbed,
    Role,
    Snowflake,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CacheManager } from "@alice-utils/managers/CacheManager";
import { Config } from "@alice-core/Config";

export const run: EventUtil["run"] = async (client) => {
    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const verificationChannel: TextChannel = <TextChannel>(
        await guild.channels.fetch(Constants.verificationChannel)
    );

    const verificationTranslationMessage: Message =
        await verificationChannel.messages.fetch("909284852724035655");

    const arrivalChannel: TextChannel = <TextChannel>(
        await guild.channels.fetch("885364743076982834")
    );

    const arrivalMessage: Message = await arrivalChannel.messages.fetch(
        "894379931121876992"
    );

    const onVerificationRole: Role = guild.roles.cache.find(
        (v) => v.name === "On Verification"
    )!;

    const getUserLanguagePreference = async (
        i: MessageComponentInteraction
    ): Promise<keyof typeof VerifyLanguage | undefined> => {
        await i.reply({
            content: MessageCreator.createPrefixedMessage(
                "Please wait...",
                Symbols.timer
            ),
            ephemeral: true,
        });

        if (!Config.botOwners.includes(i.user.id)) {
            CacheManager.userHasActiveVerificationMenu.add(i.user.id);
        }

        const userLocales: VerifyLanguage[] = [VerifyLanguage.english];

        switch (i.locale) {
            case "zh-CN":
            case "zh-TW":
                userLocales.push(
                    VerifyLanguage.chinese_simplified,
                    VerifyLanguage.chinese_traditional
                );
                break;
            case "fr":
                userLocales.push(VerifyLanguage.french);
                break;
            case "de":
                userLocales.push(VerifyLanguage.german);
                break;
            case "it":
                userLocales.push(VerifyLanguage.italian);
                break;
            case "ko":
                userLocales.push(VerifyLanguage.korean);
                break;
            case "pt-BR":
                userLocales.push(VerifyLanguage.portuguese);
                break;
            case "ru":
                userLocales.push(VerifyLanguage.russian);
                break;
            case "es-ES":
                userLocales.push(VerifyLanguage.spanish);
                break;
            case "th":
                userLocales.push(VerifyLanguage.thai);
                break;
            case "vi":
                userLocales.push(VerifyLanguage.vietnamese);
                break;
        }

        const selectedLanguage: keyof typeof VerifyLanguage | undefined = <
            keyof typeof VerifyLanguage | undefined
        >(
            await SelectMenuCreator.createSelectMenu(
                i,
                {
                    content: MessageCreator.createWarn(
                        "__Do not dismiss this message until you select a language. You will be forced to wait for a minute if you do so__." +
                            "\n\n" +
                            "Select your preferred language." +
                            "\n\n" +
                            `Based on your Discord language, you may be familiar with these languages that I provide: ${userLocales
                                .map((v) => `\`${v}\``)
                                .join(", ")}.`
                    ),
                },
                (<(keyof typeof VerifyLanguage)[]>Object.keys(VerifyLanguage))
                    .map((v) => {
                        return {
                            label: VerifyLanguage[v],
                            value: v,
                        };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label)),
                [i.user.id],
                60
            )
        )[0];

        CacheManager.userHasActiveVerificationMenu.delete(i.user.id);

        return selectedLanguage;
    };

    arrivalMessage
        .createMessageComponentCollector()
        .on("collect", async (i) => {
            if (CacheManager.userHasActiveVerificationMenu.has(i.user.id)) {
                i.reply({
                    content: MessageCreator.createReject(
                        "I'm sorry, you're still in cooldown! Please wait for a moment."
                    ),
                    ephemeral: true,
                });

                return;
            }

            const member: GuildMember = <GuildMember>i.member;

            if (TimeoutManager.isUserMuted(member)) {
                i.reply({
                    content: MessageCreator.createReject(
                        "I'm sorry, you are currently timeouted, therefore you cannot begin your verification process!"
                    ),
                    ephemeral: true,
                });

                return;
            }

            const selectedLanguage: keyof typeof VerifyLanguage | undefined =
                await getUserLanguagePreference(i);

            if (!selectedLanguage) {
                return;
            }

            switch (i.customId) {
                case "translations": {
                    const arrivalText: string = await readFile(
                        `${process.cwd()}/files/arrival/${selectedLanguage}.txt`,
                        { encoding: "utf-8" }
                    );

                    await i.editReply({
                        content:
                            MessageCreator.createAccept(
                                `Here is the arrival message translated in \`${VerifyLanguage[selectedLanguage]}\`.`
                            ) + `\n\n${arrivalText}`,
                    });
                    break;
                }
                case "verification": {
                    // I know this doesn't make sense, but just in case a staff clicks the button, this rejection message will appear
                    if (member.roles.cache.find((v) => v.name === "Member")) {
                        i.reply({
                            content: MessageCreator.createReject(
                                "I'm sorry, you have been verified!"
                            ),
                            ephemeral: true,
                        });

                        return;
                    }

                    await i.editReply({
                        content: MessageCreator.createAccept(
                            "A thread will be created for you. Please wait."
                        ),
                    });

                    await member.roles.add(onVerificationRole);

                    const isThreadPrivate: boolean =
                        member.guild.premiumTier === "TIER_2" ||
                        member.guild.premiumTier === "TIER_3";

                    const thread: ThreadChannel =
                        await verificationChannel.threads.create({
                            name: `User Verification Thread -- ${i.user.tag} (${i.user.id})`,
                            type: isThreadPrivate
                                ? "GUILD_PRIVATE_THREAD"
                                : "GUILD_PUBLIC_THREAD",
                        });

                    if (!isThreadPrivate) {
                        // Delete system notification if thread is public
                        // Set limit to just 5, the channel will not be spammed anyway so this is a safe threshold
                        const messagesToDelete: Collection<Snowflake, Message> =
                            (
                                await verificationChannel.messages.fetch({
                                    limit: 5,
                                })
                            ).filter((m) => m.system);

                        await verificationChannel.bulkDelete(
                            messagesToDelete,
                            true
                        );
                    }

                    const infoEmbed: MessageEmbed =
                        EmbedCreator.createNormalEmbed({ color: "#ffdd00" });

                    infoEmbed
                        .setAuthor({ name: "User Information" })
                        .addField(
                            "Account Creation Date",
                            member.user.createdAt.toUTCString()
                        );

                    if (
                        DateTimeFormatHelper.getTimeDifference(
                            member.user.createdAt
                        ) >
                        -86400 * 1000 * 7
                    ) {
                        infoEmbed.addField(
                            `${Symbols.exclamationMark} Account Age`,
                            DateTimeFormatHelper.secondsToDHMS(
                                Math.floor(
                                    -DateTimeFormatHelper.getTimeDifference(
                                        member.user.createdAt
                                    ) / 1000
                                )
                            )
                        );
                    }

                    const mainEmbed: MessageEmbed =
                        EmbedCreator.createNormalEmbed({ color: "#ffdd00" });

                    const verifyText: string = await readFile(
                        `${process.cwd()}/files/verify/${selectedLanguage}.txt`,
                        { encoding: "utf-8" }
                    );

                    mainEmbed
                        .setAuthor({
                            name: `Language: ${VerifyLanguage[selectedLanguage]}`,
                        })
                        .setDescription(
                            `**If you chose the wrong language, please go to ${verificationChannel} to show another language of this message**.\n\n${verifyText}`
                        );

                    await thread.send({
                        content: member.toString(),
                        embeds: [infoEmbed, mainEmbed],
                    });
                    break;
                }
            }
        });

    verificationTranslationMessage
        .createMessageComponentCollector()
        .on("collect", async (i) => {
            if (CacheManager.userHasActiveVerificationMenu.has(i.user.id)) {
                i.reply({
                    content: MessageCreator.createReject(
                        "I'm sorry, you're still in cooldown! Please wait for a moment."
                    ),
                    ephemeral: true,
                });

                return;
            }

            const selectedLanguage: keyof typeof VerifyLanguage | undefined =
                await getUserLanguagePreference(i);

            if (!selectedLanguage) {
                return;
            }

            const verifyText: string = await readFile(
                `${process.cwd()}/files/verify/${selectedLanguage}.txt`,
                { encoding: "utf-8" }
            );

            await i.editReply({
                content:
                    MessageCreator.createAccept(
                        `Here is the verification message translated in \`${VerifyLanguage[selectedLanguage]}\`.`
                    ) + `\n\n${verifyText}`,
            });
        });
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for creating collectors for buttons for newly joined members.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
