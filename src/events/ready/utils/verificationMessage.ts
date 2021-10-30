import { Constants } from "@alice-core/Constants";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { Collection, Guild, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, Role, Snowflake, TextChannel, ThreadChannel } from "discord.js";

export const run: EventUtil["run"] = async client => {
    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const verificationChannel: TextChannel = <TextChannel> await guild.channels.fetch(Constants.verificationChannel);

    const verificationMessage: Message = await verificationChannel.messages.fetch("894390503536214046");

    const arrivalChannel: TextChannel = <TextChannel> await guild.channels.fetch("885364743076982834");

    const arrivalMessage: Message = await arrivalChannel.messages.fetch("894379931121876992");

    const onVerificationRole: Role = guild.roles.cache.find(v => v.name === "On Verification")!;

    const actionRow: MessageActionRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setStyle("LINK")
                .setURL(verificationMessage.url)
                .setEmoji(Symbols.memo)
                .setLabel("How to Verify")
        );

    arrivalMessage.createMessageComponentCollector().on("collect", async i => {
        const member: GuildMember = <GuildMember> i.member;

        if (MuteManager.isUserMuted(member)) {
            i.reply({
                content: MessageCreator.createWarn("I'm sorry, you are currently muted, therefore you cannot begin your verification process!"),
                ephemeral: true
            });

            return;
        }

        // I know this doesn't make sense, but just in case a staff clicks the button, this rejection message will appear
        if (member.roles.cache.find(v => v.name === "Member")) {
            i.reply({
                content: MessageCreator.createReject("I'm sorry, you have been verified!"),
                ephemeral: true
            });

            return;
        }

        await i.reply({
            content: MessageCreator.createAccept("A thread will be created for you. Please wait."),
            ephemeral: true
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

        mainEmbed.setDescription(
            `This is the thread that will be used for your verification process.\n\n` +
            `For information on how to verify, please click the button below.\n\n` +
            `If you need help, you may ping the <@&369108742077284353> and/or <@&595667274707370024> role for assistance. You may ping them too when you're ready to verify.\n\n` +
            `**Remember to do so or else they will most likely not come to you!**`
        );

        await thread.send({
            content: member.toString(),
            embeds: [ infoEmbed, mainEmbed ],
            components: [ actionRow ]
        });
    });
};

export const config: EventUtil["config"] = {
    description: "Responsible for creating a collector for the button for new members to create threads.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};