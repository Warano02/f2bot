const axios = require("axios");
const VCFUTILS = require("../utils/spec/vcf");

module.exports = [
    {
        command: ["test"],
        desc: "",
        /**
       * 
       * @param {import('../db/types.d.ts').BotCommandContext} param0 
       */
        operate: async ({ Tayc, store }) => {
            try {
                const cc = store.contacts
                console.log(cc);

            } catch (e) {
                console.log(e);

            }
        }
    }
    ,
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
    },
    {
        command: ["filternew", "filternewcontacts", "fnc"],
        desc: "Allows you to sort the contacts in a vcf file and return only those that the user does not have",
        /**
         * 
         * @param {import("../db/types.d.ts").BotCommandContext} param0 
         */
        operate: async ({ reply, settings, react, m, cmd, prefix, Tayc }) => {
            if (!settings.asc) return reply(`Please enable *auto save contact* first by typing ${prefix}asc on then try again ! `)
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            try {
                react("⌛")
                const { data } = await axios.get(global.api + "/google/contacts/list?token=" + global.contact_key)
                const /**@type [string] */ oldContacts = data?.contacts.map(e => e.number)
                const c = m.quoted.vcf
                const new_contacts = c.filter(el => !oldContacts.includes(el.number))
                if (!new_contacts.length) return reply(`🖖 Nice you already have all of this contacts !`)
                const _ = new VCFUTILS(new_contacts)
                await Tayc.sendMessage(
                    m.chat,
                    {
                        document: _.toVCF(), mimetype: "text/vcard", fileName: "Cleaned_Contacts.vcf", caption: `✅ *New contact(s)*: ${new_contacts.length}\n> This file had ${m.quoted.vcf.length} contacts`,
                    },
                    { quoted: m, ephemeralExpiration: 86400 }
                );
                react("")
            } catch (e) {
                console.log(e);
                react("❌")
            }
        }
    }
];
