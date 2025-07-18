const fs = require('fs')
const { sleep } = require("../../lib/myfunc");
const { getAntiBadword, setAntiBadword, removeAntiBadword, getAntilink, setAntilink, removeAntilink } = require('../../lib');

module.exports = [
    {
        command: ['add'],
        operate: async (context) => {
            const { m, text, isOwner, reply, react, Tayc, isGroupAdmin } = context;
            if (!m.isGroup) return reply("*This command is only  for the group*")
            if (!isOwner) return reply("*❌ TAKE YOUR OWN to TAKE ALL YOU CAN*")
            if (!isGroupAdmin) return reply("*ℹ️ I need to be an admin of the group first*")

            let bws = m.quoted
                ? m.quoted.sender
                : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            await Tayc.groupParticipantsUpdate(m.chat, [bws], "add");
            react("✅");
        }
    },
    {
        command: ["antibadword"],
        desc: "Set antibadword in the group",
        operate: async ({ Tayc, m, reply, args, chatId, cmd, react, isGroupAdmin, isOwner }) => {
            if (!m.isGroup) return reply("*This command is only  for the group*")
            if (!isOwner) return reply("*❌ TAKE YOUR OWN to TAKE ALL YOU CAN*")
            if (!isGroupAdmin) return reply("*ℹ️ I need to be an admin of the group first*")

            const existingConfig = await getAntiBadword(chatId, 'on');
            if (existingConfig?.enable && args[0] === "on") return reply("*🚨ANTIBADWORD is already enable in this group*")
            if (!existingConfig?.enable && args[0] === "off") return reply("*🚨AntiBadword is already disabled for this group*")
            if (args[0] === 'on') {
                await setAntiBadword(chatId, 'on', 'delete');
                return Tayc.sendMessage(chatId, { text: `*AntiBadword has been enabled successfully to default action("delete"). Use ${cmd} set <action> to customize action*.\> Now the default action is *delete*` });
            } else if (args[0] === "off") {
                await removeAntiBadword(chatId);
                return Tayc.sendMessage(chatId, { text: '*AntiBadword has been disabled for this group*' });
            }
            const action = args[1]
            if (args[0] === "set" && ['delete', 'kick', 'warn'].includes(action)) {
                await setAntiBadword(chatId, 'on', action);
                return Tayc.sendMessage(chatId, { text: `*AntiBadword action set to: ${action}*` });
            } else {
                react("❌")
            }
        }
    },
    {
        command: ["antilink"],
        desc: "Set antilink in the group",
        operate: async ({ Tayc, m, reply, args, chatId, cmd, react, amGroupAdmin, isOwner }) => {
            if (!m.isGroup) return reply("*This command is only  for the group*")
            if (!isOwner) return reply("*❌ TAKE YOUR OWN to TAKE ALL YOU CAN*")
            if (!amGroupAdmin) return reply("*ℹ️ I need to be an admin of the group first*")

            const existingConfig = await getAntilink(chatId, 'on');
            if (existingConfig?.enable && args[0] === "on") return reply("*🚨ANTILINK is already enable in this group*")
            if (!existingConfig?.enable && args[0] === "off") return reply("*🚨ANTILINK is already disabled for this group*")
            if (args[0] === 'on') {
                await setAntilink(chatId, 'on', 'delete');
                return Tayc.sendMessage(chatId, { text: `*ANTILINK has been enabled successfully to default action("delete"). Use ${cmd} set <action> to customize action*.\> Now the default action is *delete*` });
            } else if (args[0] === "off") {
                await removeAntilink(chatId);
                return Tayc.sendMessage(chatId, { text: '*ANTILINK has been disabled for this group*' });
            }
            const action = args[1]
            if (args[0] === "set" && ['delete', 'kick', 'warn'].includes(action)) {
                await setAntiBadword(chatId, 'on', action);
                return Tayc.sendMessage(chatId, { text: `*ANTILINK action set to: ${action}*` });
            } else {
                react("❌")
            }
        }
    },
    {
        command: ['close'],
        operate: async (context) => {
            const { m, isBotAdmin, isGroupAdmin, react, Tayc, reply } = context;
            if (!m.isGroup) return reply("*This command is only for group*");
            if (!isGroupAdmin) return reply("*I need to be an admin first*");
            if (!isBotAdmin) return react("🙄")
            Tayc.groupSettingUpdate(m.chat, "announcement");
            reply("Group closed by admin. Only admins can send messages.");
        }
    },
    {
        command: ['getgrouppp', 'ggpp', 'getgrouprofilepic'],
        desc: "Get a profile picture ",
        operate: async ({ m, Tayc, reply, }) => {
            if (!m.isGroup) return reply("*This command is only for group*");
            try {
                const ppUrl = await Tayc.profilePictureUrl(m.chat, 'image');
                await Tayc.sendMessage(m.chat, { image: { url: ppUrl }, caption: ` *This Group's Profile Picture*` }, { quoted: m });
            } catch (r) {
                await Tayc.sendMessage(m.chat, { image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60' }, caption: '⚠️ No profile picture found for this group.' }, { quoted: m });
            }
        }
    },
    {
        command: ['link', 'linkgc', 'gclink', 'grouplink'],
        operate: async ({ Tayc, m, reply, react, isBotAdmin, isGroupAdmin }) => {
            if (!m.isGroup) return reply("*This command is only for group*");
            if (!isGroupAdmin) return reply("*I need to be an admin first*");
            if (!isBotAdmin) return react("🙄")

            try {
                let groupInvite = await Tayc.groupInviteCode(m.chat); console.log(m.groupMetadata.owner);

                let groupOwner = m.groupMetadata.participants.filter(e => e.admin === "superadmin")[0].jid;
                let groupLink = `https://chat.whatsapp.com/${groupInvite}`;
                let memberCount = m.groupMetadata.participants.length;

                let message = `🔗 *GROUP LINK*\n\n` +
                    `📌 *Name:* ${m.groupMetadata.subject}\n` +
                    `👑 *Owner:* @${groupOwner.split('@')[0]}\n` +
                    `🆔 *Group ID:* ${m.groupMetadata.id}\n` +
                    `👥 *Members:* ${memberCount}\n\n` +
                    `🌍 *Link:* ${groupLink}\n\n> TAKE ALL YOU CAN`;

                Tayc.sendMessage(m.chat, { text: message, mentions: [groupOwner] }, { detectLink: true });
            } catch (error) {
                reply("❌ *Failed to fetch group link. Make sure the bot has admin permissions.*");
            }
        }
    },
    {
        command: ['mediatag'],
        operate: async (context) => {
            const { m, participants, Tayc, reply, cmd } = context;
            if (!m.isGroup) return reply("*This command is only useful in the group*");
            if (!m.quoted) return reply(`Reply to any media with caption ${cmd}`);
            Tayc.sendMessage(m.chat, { forward: m?.quoted?.fakeObj, mentions: participants.map((a) => a.id), });
        }
    },
    {
        command: ['open'],
        operate: async (context) => {
            const { m, isBotAdmin, isGroupAdmin, react, Tayc, reply } = context;
            if (!m.isGroup) return reply("*This command is only for group*");
            if (!isGroupAdmin) return reply("*I need to be an admin first*");
            if (!isBotAdmin) return react("🙄")

            Tayc.groupSettingUpdate(m.chat, "not_announcement");
            reply("Group opened by admin. Members can now send messages.");
        }
    },
    {
        command: ['poll',],
        operate: async (context) => {
            const { m, mess, text, isCreator, prefix, Tayc, isGroup, reply, cmd } = context;
            if (!m.isGroup) return reply("❌");
            let [poll, opt] = text.split("|");
            if (text.split("|").length < 2)
                return await reply(
                    `Enter a question and at least 2 options\nExample: ${cmd} Who is best player?|Messi,Ronaldo,None...`
                );
            let options = [];
            for (let i of opt.split(",")) {
                options.push(i);
            }

            await Tayc.sendMessage(m.chat, {
                poll: {
                    name: poll,
                    values: options,
                },
            });
        }
    },
    {
        command: ["tagall"],
        desc: "Mention all the members of the group",
        operate: async ({ reply, isGroup, react, m }) => {
            try {
                if (!isGroup) return reply("❌ *This command is only useful in the group*")
                const t = m?.groupMetadata
                if (!t) return react("❌")
                let text = `*TAGGED BY:* ${m.pushName}\n\n`
                text += t.participants.map((e, i) => i + 1 + " @" + e.jid.split('@')[0]).join("\n")
                reply(text, t.participants.map(e => e.jid))
            } catch (e) {
                console.log(e)
            }
        }
    },
    {
        command: ["tag"],
        desc: "Mention all the members of the group",
        operate: async ({ reply, isGroup, react, m, text }) => {
            try {
                if (!isGroup) return reply("❌ *This command is only useful in the group*")
                const t = m?.groupMetadata
                reply(text || '', t.participants.map(e => e.jid))
            } catch (e) {
                console.log(e)
            }
        }
    },
    {
        command: ['vcf'],
        operate: async ({ Tayc, m, reply }) => {
            if (!m.isGroup) return reply("This command is only for group");
            let details = m.groupMetadata
            let vcard = "";
            let noPort = 0;
            for (let a of details.participants) {
                vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.jid.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.jid.split("@")[0]}:+${a.jid.split("@")[0]}\nEND:VCARD\n`;
            }
            let nmfilect = "./contacts.vcf";
            fs.writeFileSync(nmfilect, vcard.trim());
            await sleep(1000);
            Tayc.sendMessage(
                m.chat,
                {
                    document: fs.readFileSync(nmfilect),
                    mimetype: "text/vcard",
                    fileName: "Contact.vcf",
                    caption: `Group: *${details.subject}*\nContacts: *${details.participants.length}*`,
                },
                { ephemeralExpiration: 86400, quoted: m }
            );
            fs.unlinkSync(nmfilect);
        }
    },
]