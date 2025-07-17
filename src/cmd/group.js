module.exports = [
    {
        command: ["antibadword"],
        desc: "Set antibadword in the group",
        operate: async ({ }) => {

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
        command: ["tagall"],
        desc: "Mention all the members of the group",
        operate: async ({ reply, isGroup, react, m }) => {
            try {
                if (!isGroup) return reply("❌ *This command is only useful in the group*")
                const t = m?.groupMetadata
                if (!t) return react("❌")
                let text = `*TAGGED BY:* ${m.pushName}\n\n`
                 text += t. participants.map((e, i) => i+1+ " @" + e.jid.split('@')[0]).join("\n")
                reply(text, t. participants.map(e => e.jid))
            } catch (e) {
                console.log(e)
            }
        }
    },
    {
        command: ["tag"],
        desc: "Mention all the members of the group",
        operate: async ({ reply, isGroup, react, m }) => {
            try {
                if (!isGroup) return reply("❌ *This command is only useful in the group*")
                const t = m?.groupMetadata
                reply('', t. participants.map(e => e.jid))
            } catch (e) {
                console.log(e)
            }
        }
    },
]