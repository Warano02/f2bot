module.exports=[
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
        command: ["forward", "fw",],
        desc: "Forward message to contacts inside a .vcf (reply to vcf)",
        operate: async ({ Tayc, m, text, reply, FORWARDMESSAGE, cmd, react }) => {
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

            reply(`📨 Starting broadcast to ${jids.length} contacts...`);

            const result = await FORWARDMESSAGE(Tayc, jids, text);
            if (result?.error) {
                console.log(result);
                
                react('❌')
                reply(result?.msg || "done");
            }
        }
    }
]