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
        operate: async ({ }) => {
            if (!isGroup) return reply("❌*This command can only be use in the group*")
            const status = getForwardStatus();
            if (status?.isRunning) return reply("📭 *Am in working.* please try again later !");
            const t = m?.groupMetadata.participants.map(e => e.jid)
            if (!text) return reply("*❌ Please provide the text to forward*")
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