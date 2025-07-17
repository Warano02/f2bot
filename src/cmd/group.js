const fs=require('fs')
const {sleep}=require("../../lib/myfunc")
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
        operate: async ({ reply, isGroup, react, m,text }) => {
            try {
                if (!isGroup) return reply("❌ *This command is only useful in the group*")
                const t = m?.groupMetadata
                reply(text||'', t. participants.map(e => e.jid))
            } catch (e) {
                console.log(e)
            }
        }
    },
    {
    command: ['vcf'],
    operate: async ({ Tayc, m, reply, mess, participants, isCreator, groupMetadata }) => {
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