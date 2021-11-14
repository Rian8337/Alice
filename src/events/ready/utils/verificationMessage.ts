import { readFile } from "fs/promises";
import { Constants } from "@alice-core/Constants";
import { VerifyLanguage } from "@alice-enums/events/VerifyLanguage";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { Collection, Guild, GuildMember, InteractionReplyOptions, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, Role, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CacheManager } from "@alice-utils/managers/CacheManager";

export const run: EventUtil["run"] = async client => {
    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const verificationChannel: TextChannel = <TextChannel> await guild.channels.fetch(Constants.verificationChannel);

    const verificationTranslationMessage: Message = await verificationChannel.messages.fetch("909284852724035655");

    const arrivalChannel: TextChannel = <TextChannel> await guild.channels.fetch("885364743076982834");

    const arrivalMessage: Message = await arrivalChannel.messages.fetch("894379931121876992");

    await arrivalMessage.edit({
        content: MessageCreator.createWarn("Here are the available actions."),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("translations")
                        .setLabel("List Available Translations")
                        .setEmoji(Symbols.memo)
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId("verification")
                        .setLabel("Begin Verification Process")
                        .setEmoji(Symbols.personRunning)
                        .setStyle("PRIMARY")
                )
        ]
    });

    await verificationTranslationMessage.edit({
        content: MessageCreator.createWarn("Here are the available actions."),
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("whatever")
                        .setLabel("List Available Translations")
                        .setEmoji(Symbols.memo)
                        .setStyle("SUCCESS")
                )
        ]
    });

    const onVerificationRole: Role = guild.roles.cache.find(v => v.name === "On Verification")!;

    const mutedRejectionOptions: InteractionReplyOptions = {
        content: MessageCreator.createReject("I'm sorry, you are currently muted, therefore you cannot begin your verification process!"),
        ephemeral: true
    };

    const getUserLanguagePreference = async (i: MessageComponentInteraction): Promise<keyof typeof VerifyLanguage | undefined> => {
        await i.reply({
            content: MessageCreator.createPrefixedMessage("Please wait...", Symbols.timer),
            ephemeral: true
        });

        CacheManager.userHasActiveVerificationMenu.add(i.user.id);

        const selectedLanguage: keyof typeof VerifyLanguage | undefined = <keyof typeof VerifyLanguage | undefined> (await SelectMenuCreator.createSelectMenu(
            i,
            {
                content: MessageCreator.createWarn("__Do not dismiss this message. You will be forced to wait for a minute if you do so__.\n\nSelect your preferred language.")
            },
            (<(keyof typeof VerifyLanguage)[]> Object.keys(VerifyLanguage)).map(v => {
                return {
                    label: VerifyLanguage[v],
                    value: v
                };
            }).sort((a, b) => a.label.localeCompare(b.label)),
            [i.user.id],
            60
        ))[0];

        CacheManager.userHasActiveVerificationMenu.delete(i.user.id);

        return selectedLanguage;
    };

    arrivalMessage.createMessageComponentCollector().on("collect", async i => {
        if (CacheManager.userHasActiveVerificationMenu.has(i.user.id)) {
            i.reply({
                content: MessageCreator.createReject("I'm sorry, you're still in cooldown! Please wait for a moment.")
            });

            return;
        }

        const member: GuildMember = <GuildMember> i.member;

        if (MuteManager.isUserMuted(member)) {
            i.reply(mutedRejectionOptions);

            return;
        }

        const selectedLanguage: keyof typeof VerifyLanguage | undefined = await getUserLanguagePreference(i);

        if (!selectedLanguage) {
            return;
        }

        switch (i.customId) {
            case "translations":
                const arrivalText: string = await readFile(`${process.cwd()}/files/arrival/${selectedLanguage}.txt`, { encoding: "utf-8" });

                await i.editReply({
                    content: MessageCreator.createAccept(`Here is the arrival message translated in \`${VerifyLanguage[selectedLanguage]}\`.`) + `\n\n${arrivalText}`
                });
                break;
            case "verification":
                await i.editReply({
                    content: MessageCreator.createAccept("A thread will be created for you. Please wait."),
                });

                await member.roles.add(onVerificationRole);

                const isThreadPrivate: boolean = member.guild.premiumTier === "TIER_2" || member.guild.premiumTier === "TIER_3";

                const thread: ThreadChannel = await verificationChannel.threads.create({
                    name: `User Verification Thread -- ${i.user.tag} (${i.user.id})`,
                    type: isThreadPrivate ? "GUILD_PRIVATE_THREAD" : "GUILD_PUBLIC_THREAD"
                });

                if (!isThreadPrivate) {
                    // Delete system notification if thread is public
                    // Set limit to just 5, the channel will not be spammed anyway so this is a safe threshold
                    const messagesToDelete: Collection<Snowflake, Message> =
                        (await verificationChannel.messages.fetch({ limit: 5 })).filter(m => m.system);

                    await verificationChannel.bulkDelete(messagesToDelete, true);
                }

                const infoEmbed: MessageEmbed = EmbedCreator.createNormalEmbed(
                    { color: "#ffdd00" }
                );

                infoEmbed.setAuthor("User Information")
                    .addField("Account Creation Date", member.user.createdAt.toUTCString());

                if (DateTimeFormatHelper.getTimeDifference(member.user.createdAt) > -86400 * 1000 * 7) {
                    infoEmbed.addField(
                        `${Symbols.exclamationMark} Account Age`,
                        DateTimeFormatHelper.secondsToDHMS(
                            Math.floor(
                                -DateTimeFormatHelper.getTimeDifference(member.user.createdAt) / 1000
                            )
                        )
                    );
                }

                const mainEmbed: MessageEmbed = EmbedCreator.createNormalEmbed(
                    { color: "#ffdd00" }
                );

                const verifyText: string = await readFile(`${process.cwd()}/files/verify/${selectedLanguage}.txt`, { encoding: "utf-8" });

                mainEmbed.setAuthor(`Language: ${VerifyLanguage[selectedLanguage]}`)
                    .setDescription(verifyText);

                await thread.send({
                    content: member.toString(),
                    embeds: [ infoEmbed, mainEmbed ]
                });
                break;
        }
    });

    verificationTranslationMessage.createMessageComponentCollector().on("collect", async i => {
        if (CacheManager.userHasActiveVerificationMenu.has(i.user.id)) {
            i.reply({
                content: MessageCreator.createReject("I'm sorry, you're still in cooldown! Please wait for a moment.")
            });

            return;
        }

        const selectedLanguage: keyof typeof VerifyLanguage | undefined = await getUserLanguagePreference(i);

        if (!selectedLanguage) {
            return;
        }

        const verifyText: string = await readFile(`${process.cwd()}/files/verify/${selectedLanguage}.txt`, { encoding: "utf-8" });

        await i.editReply({
            content: MessageCreator.createAccept(`Here is the verification message translated in \`${VerifyLanguage[selectedLanguage]}\`.`) + `\n\n${verifyText}`
        });
    });
};

export const config: EventUtil["config"] = {
    description: "Responsible for creating collectors for buttons for newly joined members.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};