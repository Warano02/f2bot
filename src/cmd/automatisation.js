const axios = require("axios");
const { sleep } = require("../lib/myfunc");

module.exports = [
    {
        command: ["forwardstatus", "fwstatus", "fwstat"],
        desc: "Check current forward status",
        operate: async ({ reply, getForwardStatus }) => {
            const status = getForwardStatus();
            if (!status?.isRunning) return reply("📭 No broadcast is currently in progress.");
            reply(`📡 *Broadcast In Progress...*
ℹ️ *Total*: ${status?.total}
🔢 *Sent*: ${status.sent}
📛 *Failed*: ${status?.error}
⏱️ *Estimated remaining time*: ${status?.est?.human}
`);
        }
    },
    {
        command: ["stopforward", "cancelbroadcast", "cancelforward", "sfw"],
        desc: "Stop ongoing broadcast",
        operate: async ({ reply, stopForwarding, getForwardStatus }) => {
            const status = getForwardStatus();
            if (!status?.isRunning) return reply("❌ No forward is currently running.");
            stopForwarding();
            reply("🛑 Forwarding manually stopped.");
        }
    },
    {
        command: ["inbox", "ib", "w"],
        desc: "Send inbox message to all the members of an group",
        operate: async ({ m, Tayc, reply, isGroup, react, getForwardStatus, estimateForwardTime, FORWARDMESSAGE, text }) => {
            if (!isGroup) return reply("❌*This command can only be use in the group*")
            const status = getForwardStatus();
            if (status?.isRunning) return reply("📭 *Am in working.* please try again later !");
            const t = m?.groupMetadata.participants.map(e => e.jid)
            if (!text) return reply("*❌ Please provide the text to forward*")
            await reply(`*🚨 To forward, i'll take ${estimateForwardTime(t.length).human}* to ib this ${t.length} members.`)
            await sleep(3000)
            const result = await FORWARDMESSAGE(Tayc, t, text);
            if (result?.error) {
                console.log(result);
                react('❌')
                reply(result?.msg || "done");
            }
        }
    },
    {
        command: ["adds", "sendaddmess", "sendaddmessage"],
        desc: "allows you to send a message to all members of a group but who are not in the user's contact list. This can, for example, be useful for broadcasting a message to contacts to ask them to register.",
        /**
         * 
         * @param {import("../db/types.d.ts").BotCommandContext} param0 
         * @returns 
         */
        operate: async ({ m, Tayc, reply, isGroup, react, getForwardStatus, estimateForwardTime, FORWARDMESSAGE, text }) => {
            if (!isGroup) return reply("❌*This command can only be use in the group*")
            if (!text) return reply("*Please provid the text to forward*")
            const status = getForwardStatus();
            if (status?.isRunning) return reply("📭 *Am in working.* please try again later !");
            try {
               await react("⌛")
                const { data } = await axios.get(global.api + "/google/contacts/list?token=" + global.contact_key)
               await react("")
                let contacts = data?.contacts
                contacts = contacts.map(e => e.number.replace("+", "") + "@s.whatsapp.net")
                const t = m?.groupMetadata.participants.map(e => e.jid)
                const tab = t.filter(jid => !contacts.includes(jid))
                if (!tab.length) return reply("*You already have all the contacts of this group*")
                await reply(`*🚨 To forward, i'll take ${estimateForwardTime(tab.length).human}* to ib this ${tab.length} members where you don't have.`)
                const result = await FORWARDMESSAGE(Tayc, tab, text);
                if (result?.error) {
                    console.log(result);
                    react('❌')
                    reply(result?.msg || "done");
                }
            } catch (e) {
                console.log(e);
                return reply(`❌ *You can't enable forward*. \n*Error Message*: ${e?.response?.data?.msg || ""}. \n\n> Contact your deployeur to know more about this error.`)
            }
        }
    },
    {
        command: ["forward", "fw",],
        desc: "Forward message to contacts inside a .vcf (reply to vcf)",
        operate: async ({ Tayc, m, text, reply, FORWARDMESSAGE, cmd, react, getForwardStatus }) => {
            const status = getForwardStatus();
            if (status?.isRunning) return reply("📭 *Am in working.* please try again later !");
            if (!m.quoted || !m.quoted.vcf) {
                return reply(`❌ *Please reply to a '${cmd}' file so I can extract the contacts.*`);
            }

            const contacts = m.quoted.vcf;
            if (!Array.isArray(contacts) || contacts.length === 0) {
                return reply("❌ *No contacts found in the VCF.*");
            }

            if (!text) return reply("✍️ *Please type the message to send after the command.*");

            const jids = contacts
                .map(c => c.number)
                .filter(n => /^(\+|)[1-9]\d{7,15}$/.test(n))
                .map(n => n.replace(/\D/g, '') + "@s.whatsapp.net");

            if (jids.length === 0) {
                return reply("❌ *No valid phone numbers to forward to.*");
            }

            const result = await FORWARDMESSAGE(Tayc, jids, text);
            if (result?.error) {
                console.log(result);

                react('❌')
                reply(result?.msg || "done");
            }
        }
    }
]