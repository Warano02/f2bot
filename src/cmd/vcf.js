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
        command: ["previewcontacts", "pvc"],
        desc: 'Send a preview of all contact in the vcf',
        operate: async ({ m, cmd, reply }) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            const vcfUtils = new VCFUTILS(m.quoted.vcf);
            let tab = vcfUtils.exportToJSON()
            const list = tab.map((el, i) => i + 1 + ". @" + el.number).join("\n")
            const tags = tab.map(e => e.jid)
            console.log(tags);

            await reply(`Here is all the ${tab.length} contact(s):\n${list}\n\n> Take All You Can`, tags)
        }
    },
    {
        command: ["tovcf", "tagtovcf", "tagalltovcf", "ttvcf"],
        desc: "allows you to transform the tagAll that you have recovered into a vcf file that you can then process",
        /**
         * 
         * @param {import('../db/types.d.ts').BotCommandContext} param0 
         */
        operate: async ({ Tayc, m, reply, text }) => {
            if (!text) return reply(`*Please provide the tagall message*`)
            let txt = text.trim()
                .split("\n")
                .map(e => e.replaceAll(" ", "").split('@'))
                .map(e => e[1] || e[0])
                .map(e => e.replaceAll(/[^\d]/g, ""))
                .filter(e => /^\d+$/.test(e) && e.length > 5)
                .map((e, i) => { return { name: `addByTayc-${i}`, number: e } })

            if (!txt.length) return reply("0 valid contact found")
            const c = new VCFUTILS(txt)
            await Tayc.sendMessage(
                m.chat,
                {
                    document: c.toVCF(), mimetype: "text/vcard", fileName: "Cleaned_Contacts.vcf", caption: `✅ Tag to vcf. ${txt.length} valid contacts!`,
                },
                { quoted: m, ephemeralExpiration: 86400 }
            );
        }
    }
];
