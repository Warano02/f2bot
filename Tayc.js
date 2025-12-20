require("dotenv").config()
const chalk = require('chalk')
const readline = require('readline')
const PhoneNumber = require('awesome-phonenumber')
const NodeCache = require("node-cache")
const pino = require("pino")
global.api = process.env.API || "https://tayc-api.onrender.com"
const { Sticker } = require('wa-sticker-formatter')
const fs = require('fs')
const axios = require('axios')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")
require("./src/db/config")

const { handleMessages, ScheduledMessages } = require('./main')
const { loadCommands, watchCommands } = require('./src/lib/loader')

const { startAutoClear } = require('./src/lib/myfunc2')
global.currentClient = null
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = async (text) => {
    return new Promise((resolve) => {
        console.log(text);
        rl.question('', resolve);
    });
};

function generateBotInfoCard({
    name = "TAYC",
    username = "Warano Dev",
    platform = "Panel",
    prefix = ".",
    mode = "Private",
    version = "1.0.0",
    link = "https://sapjasha.com",
} = {}) {
    return `
*╔───────* *『*  *${name}*  *』* *═───────╗*
*»*  *Username:* *${username}*  
*»*  *Platform:* *${platform}*  
*»*  *Prefix:* *[ ${prefix} ]*  
*»*  *Mode:* *${mode}*  
*»*  *Version:* *[ ${version} ]*  
*»*  ${link}  
*╚═══════════════════════╝*`.trim();
}
const package = require('./package.json')
const { LOADSETTINGS } = require("./src/lib/myfunc")
const handleGroupParticipantUpdate = require("./src/utils/handler/handleGroupParticipantUpdate")
const handleStatusUpdate = require("./src/utils/handler/handleStatus")
const stngs = LOADSETTINGS()

const store = {
    messages: {},
    contacts: {},
    chats: {},
    groupMetadata: async (jid) => ({}),
    bind: function (ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (msg.key && msg.key.remoteJid) {
                    this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {}
                    this.messages[msg.key.remoteJid][msg.key.id] = msg
                }
            })
        })
        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = contact
                }
            })
        })
        ev.on('chats.set', (chats) => {
            this.chats = chats
        })
    },
    loadMessage: async (jid, id) => {
        return this.messages[jid]?.[id] || null
    }
}

async function startTaycInc() {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const TaycInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            const jid = jidNormalizedUser(key.remoteJid)
            const msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache
    })

    store.bind(TaycInc.ev)
    TaycInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s;
        if (connection === 'open') {
            global.currentClient = TaycInc;
            const botNumber = TaycInc.user.id.split(':')[0] + '@s.whatsapp.net';
            await TaycInc.sendMessage(botNumber, {
                text: generateBotInfoCard({ username: TaycInc.user.name, version: package.version, prefix: stngs.settings.prefix, mode: stngs.settings.mode })
            });
            console.log(chalk.green("Connected ✅"));
        }
        if (connection === "close" && lastDisconnect && lastDisconnect.error?.output?.statusCode !== 401) {
            console.log(chalk.red("Reconnexion..."));
            setTimeout(startTaycInc, 5000);
        }
    });

    TaycInc.ev.on('messages.upsert', async (chatUpdate) => {
        try {

            const mek = chatUpdate.messages[0]
            if (!mek.message) return

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatusUpdate(TaycInc, chatUpdate)
                return
            }
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
            await handleMessages(TaycInc, chatUpdate, store)
        } catch (err) {
            console.error("Error in messages.upsert:", err)
        }
    })

    TaycInc.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(TaycInc, update)
    })

    TaycInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        }
        return jid
    }

    TaycInc.sendImageAsStickers = async (jid, input, m) => {
        if (!jid || !input) return
        let buffer
        if (typeof input === 'string' && input.startsWith('http')) {
            const res = await axios.get(input, { responseType: 'arraybuffer' })
            buffer = Buffer.from(res.data)
        }
        if (typeof input === 'string') buffer = fs.readFileSync(input)
        if (Buffer.isBuffer(input)) { buffer = input }
        if (!buffer) throw new Error('Invalid input for sendImageAsSticker')
        const sticker = new Sticker(buffer, { pack: "Tayc Bot", author: "Warano", quality: 70 })
        return TaycInc.sendMessage(jid, await sticker.toMessage(), { quoted: m })

    }

    TaycInc.getName = (jid, withoutContact = false) => {
        const id = TaycInc.decodeJid(jid)
        withoutContact = TaycInc.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) {
            return new Promise(async (resolve) => {
                v = store.contacts[id] || {}
                if (!(v.name || v.subject)) v = await TaycInc.groupMetadata(id) || {}
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
            })
        } else {
            v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } :
                id === TaycInc.decodeJid(TaycInc.user.id) ? TaycInc.user :
                    (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        }
    }


    if (!TaycInc.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumber
        phoneNumber = await question(chalk.bgBlack(chalk.underline.greenBright(`\nEnter your phone number without (+) : `)))
        // Clean the phone number - remove any non-digit characters
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        // Validate the phone number using awesome-phonenumber
        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red(chalk.underline.bgBlue("Enter your phoneNumber without (+):")));
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await TaycInc.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.underline.bgGreen(`\n\nYour Pairing Code : `)), chalk.underline.black(chalk.white(code)))
                console.log(chalk.yellow(`\n Waiting for you to connect...`))
            } catch (error) {
                console.error('Error requesting pairing code:', error)
                console.log(chalk.red('Failed to get pairing code. Please check your phone number and try again.'))
            }
        }, 3000)
    }
    TaycInc.ev.on('creds.update', saveCreds)
}

loadCommands()
watchCommands()
startAutoClear()

startTaycInc().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})

setInterval(() => {
    if (global.currentClient?.user && global.currentClient?.ws?.socket?._readyState === 1) {
        ScheduledMessages(global.currentClient);
    }
}, 30 * 1000);





process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})
