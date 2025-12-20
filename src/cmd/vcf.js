const axios = require("axios");
const VCFUTILS = require("../utils/spec/vcf");
const { sleep } = require("../lib/myfunc.js");

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

            const list = tab.map((el, i) => ` 👤: *${el.name}* \n *N°* : @${el.number}\n\n`).join("\n")
            const tags = tab.map(e => e.jid)
            //  console.log(tags);

            await reply(`Here is all the ${tab.length} contact(s):\n${list}\n\n> Take All You Can`, tags)
        }
    },
    {
        command: ["addsufix", "asfx"],
        desc: "Add a sufix to all contact name in the vcf",
        operate: async ({ m, cmd, reply, text, Tayc }) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            if (!text) return reply(`❌*Please provide the sufix to add to all contact name*\n*Usage*:\n> ${command} <sufix>`)
            const vcfUtils = new VCFUTILS(m.quoted.vcf);
            vcfUtils.addSufixToNames(text);
            await Tayc.sendMessage(
                m.chat,
                {
                    document: vcfUtils.toVCF(), mimetype: "text/vcard", fileName: "Cleaned_Contacts.vcf", caption: `✅ Sufix added to all contact name`,
                },
                { quoted: m, ephemeralExpiration: 86400 }
            );
        }
    },
    {
        command: ["onlyfiltercountry", "ofc"],
        desc: "Filter the contact by country code",
        operate: async ({ m, cmd, reply, text, Tayc }) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            if (!text) return reply(`❌*Please provide the country code to filter*\n*Usage*:\n> ${command} <country code>\n\n*Example*:\n> ${command}  +237`)

            const vcfUtils = new VCFUTILS(m.quoted.vcf);
            const result = vcfUtils.filterByCountryCode(text.startsWith("+") ? text : `+${text}`);
            if (result.toVCF().length === 0) return reply(`*No contact found with ${text} country code*`)
            await Tayc.sendMessage(
                m.chat,
                {
                    document: vcfUtils.toVCF(), mimetype: "text/vcard", fileName: "Cleaned_Contacts.vcf", caption: `✅  Contacts filtered by  country code ${text}`,
                },
                { quoted: m, ephemeralExpiration: 86400 }
            );
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
    },
    {
        command: ["sectionvcf", "svcf"],
        desc: "allows you to split a vcf file into several",
        operate: async ({ Tayc, text, reply, m }) => {
            if (!m.quoted || !m?.quoted.vcf) return reply(`*Reply to a vcf file using ${cmd}*`);
            if (m.quoted.vcf.length === 0) return reply("*This vcf file doesn't contain valid contacts.*");
            if (!text) return reply("Please provide the parameter to split your vcf")
            if (text > m.quoted.vcf.length) return reply("*🥸 You need to enter limit less than this vcf contacts lenght*")
            const tabs = m.quoted.vcf.reduce((acc, _, i) => {
                if (i % text === 0) acc.push(m.quoted.vcf.slice(i, i + text));
                return acc;
            }, []);
            let tmp, i = 1
            for (const tab of tabs) {
                tmp = new VCFUTILS(tab)
                await Tayc.sendMessage(
                    m.chat,
                    {
                        document: tmp.toVCF(), mimetype: "text/vcard", fileName: `Cleaned_Contact${i}.vcf`, caption: `*Section ${i}.*`,
                    },
                    { quoted: m }
                );
                await sleep(3000)
                i++
            }
        }
    }
];
