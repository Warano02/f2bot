const VCFUTILS = require("../utils/spec/vcf");

module.exports = [
    {
        command: ["removeduplicatecontact", "rdc"],
        desc: "Remove duplicated contact",
        operate: async ({ reply, Tayc, m, cmd }) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");

            const vcfUtils = new VCFUTILS(m.quoted.vcf);
            vcfUtils.removeDuplicateContacts();
            await Tayc.sendMessage(
                m.chat,
                {
                    document: vcfUtils.toVCF(),
                    mimetype: "text/vcard",
                    fileName: "Cleaned_Contacts.vcf",
                    caption: `✅ Duplicates removed from your VCF file.`,
                },
                { quoted: m, ephemeralExpiration: 86400 }
            );
        },
    },
    {
        command: ["addflagcountry", "addcountryflag", "acf", "afc"],
        desc: "Add a country flag of an contact to start or and of their name",
        operate: async ({ reply, Tayc, m, cmd, text, command }) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            if (text && !["end", "start"].includes(text)) return reply(`❌*Invalid parameter*\n*Usage*:\n> ${command} <start || end>`)
            const vcfUtils = new VCFUTILS(m.quoted.vcf);
            vcfUtils.addCountryFlagToNames();
            await Tayc.sendMessage(
                m.chat,
                {
                    document: vcfUtils.toVCF(), mimetype: "text/vcard", fileName: "Cleaned_Contacts.vcf", caption: `✅ Country`,
                },
                { quoted: m, ephemeralExpiration: 86400 }
            );
        }
    },
    {
        command: ["previexcontacts", "pvc"],
        desc: 'Send a preview of all contact in the vcf',
        operate: async ({ Tayc, m, cmd ,reply}) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            const vcfUtils = new VCFUTILS(m.quoted.vcf);
            let tab = vcfUtils.exportToJSON()
            const v = (e) => {
                return ` 'BEGIN:VCARD\n'd
            + 'VERSION:3.0\n'
            + 'FN:${e?.name}\n' 
            + 'ORG:Ashoka Uni;\n' 
            + 'TEL;type=CELL;type=VOICE;waid=${e?.number + ':' + e?.number}\n' 
            + 'END:VCARD'`
            }
            Tayc.sendMessage(m.chat, {
                text: `Here is all the ${tab.length} contact(s)`,
                cards: tab.map(el => {
                    return {
                        contacts: {
                            displayName: el?.name,
                            contacts: [{ vcard:v(el) }]
                        }
                    }
                }),
                footer: '> Take All You Can'
            })
        }
    }
];
