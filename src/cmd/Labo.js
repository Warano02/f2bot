const fs = require("fs")
const path = require('path')
const { sleep } = require("../lib/myfunc")
const filePath = path.join(__dirname, "../db/contacter.json")
function getDynamicDelay(index) {
    const base = 15000;
    const jitter = Math.random() * 8000 - 4000;
    const progressive = Math.min(index * 20, 4000);
    return base + jitter + progressive;
}
module.exports = [
    {
        command: ['load'],
        desc: 'Load all the number of an vcf file',

        operate: async ({ quoted, reply, cmd }) => {
            if (!quoted || !quoted.vcf || !quoted.vcf.length) return reply(`Please reply to a vcf file using ${cmd} `)
            const numbers = quoted.vcf.map(el => el.number + '@s.whatsapp.net')
            fs.writeFileSync(filePath, JSON.stringify(numbers), 'utf-8')
            reply(`All this ${numbers.length} numbers has been load successfully an is ready for forwarding.`)
        }
    },
    {
        command: ["muss"],
        desc: "Forward a media message",
        /**
       * 
       * @param {import('../db/types').BotCommandContext} param0 
       */
        operate: async ({ Tayc, reply, m, prefix, cmd }) => {
            const /**@type [string] */ jids = JSON.parse(fs.readFileSync(filePath))
            if (!jids?.length) return reply(`Please Load the numbers first by typing ${prefix}load `)
            if (!m.quoted) return reply(`Please reply to a media(image) message using ${cmd}`)
            const mime = m.quoted?.mtype
            const caption = m.quoted?.caption || ""
            const media = await m.quoted.download()
            const success = []
            const error = []
            for (let i = 0; i < jids.length; i++) {
                const jid = jids[i];
                try {
                    while (Date.now() - global.lastreceivemessage < 20000) {
                        const wait = 20000 - (Date.now() - global.lastreceivemessage);
                        console.log(`🕒Forwarding pause, WhatsApp is actif. waiting... ${Math.ceil(wait / 1000)}s`);
                        await sleep(10000);
                    }
                    await Tayc.sendMessage(jid, { image: media, caption ,mentions:['237656496106@s.whatsapp.net','237655669575@s.whatsapp.net','237682106989@s.whatsapp.net']},);
                    success.push(jid)
                } catch (e) {
                    console.log(e);
                    error.push(jid)
                }
                if (i > 0 && i % 15 === 0) {
                    const pause = (3 + Math.random() * 3) * 60 * 1000;
                    await sleep(pause);
                } else {
                    await sleep(getDynamicDelay(i));
                }
            }

            reply(`Forwarding made successfully to all the ${jids.length} numbers.\n- *Sucess*: ${success.length}\n- *Error*: ${error.length}`)
        }
    }
]