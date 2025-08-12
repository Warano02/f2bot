const { GETSETTINGS, smsg, GETPRIVACY, LOADSETTINGS, sleep, SAVENEWCONTACTS, LOADCONTACTS, getPrompt, addToGlobalHistory } = require('./src/lib/myfunc');
const fs = require('fs');
const path = require('path');

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const { writeFile } = require('fs/promises');
const logMessage = require('./src/lib/statique.js');
const { getCommands } = require('./src/lib/loader.js');
const chalk = require('chalk');
const { FORWARDMESSAGE, estimateForwardTime, getForwardStatus, stopForwarding } = require('./src/lib/forwarder.js');
const axios = require('axios');
const { saveContact } = require('./src/utils/spec/contacts.js');
const PQueue = require("p-queue").default;
const queue = new PQueue({ concurrency: 1, interval: 20000, intervalCap: 1 });

const contactsListMap = new Map()
/**@type {Map<string,import("./src/db/types.d.ts").GroupContactCount>} */
const grouperMap = new Map()
const groupSave = new Map()
const messageStore = new Map();
const addQeu = new Map()
const processingAdd = new Map()
const diffusionModeContacts = new Map()
const ALL_SETTINGS_PATH = path.join(__dirname, './src/db/settings.json');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const flags = require('emoji-flags');
const handleQuotedMessage = require('./src/utils/handler/handleQuotedMessage.js');
const { handleBadwordDetection, Antilink } = require('./src/utils/handler/AntiX.js');


/**
 * 
 * @param {object} newSettings 
 */

function saveNewSetting(newSettings) {
    fs.writeFileSync(ALL_SETTINGS_PATH, JSON.stringify(newSettings, null, 2));
}
// Sauvegarde des messages
async function storeMessage(message, isUser) {
    try {

        const config = GETSETTINGS();

        if (config.antidelete === "off") return;
        if (!message.key?.id) return;

        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;

        let content = '';
        let mediaType = '';
        let mediaPath = '';

        const m = message.message;

        if (m?.conversation) {
            content = m.conversation;
        } else if (m?.extendedTextMessage?.text) {
            content = m.extendedTextMessage.text;
        }

        /**
         * @typedef {"image" | "video" | "audio" |"sticker"| "document"} MimeFolder
         */

        /** @type {{ type: string, ext: string | (() => string), mimeFolder: MimeFolder }[]} */

        const mediaHandlers = [
            { type: 'imageMessage', ext: '.jpg', mimeFolder: 'image' },
            { type: 'videoMessage', ext: '.mp4', mimeFolder: 'video' },
            { type: 'audioMessage', ext: '.mp3', mimeFolder: 'audio' },
            {
                type: 'documentMessage',
                ext: () => {
                    const filename = m.documentMessage?.fileName || '';
                    const dotExt = path.extname(filename);
                    return dotExt || '.bin';
                },
                mimeFolder: 'document'
            },
            { type: 'stickerMessage', ext: '.webp', mimeFolder: 'sticker' }
        ];

        for (const handler of mediaHandlers) {
            if (m?.[handler.type]) {
                mediaType = handler.type.replace('Message', '');
                const ext = typeof handler.ext === 'function' ? handler.ext() : handler.ext;
                const stream = await downloadContentFromMessage(m[handler.type], handler.mimeFolder);
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                mediaPath = getMediaPath(messageId, ext);
                await writeFile(mediaPath, buffer);

                if (m[handler.type]?.caption && !content) {
                    content = m[handler.type].caption;
                }
                break;
            }
        }

        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: new Date().toISOString(),
            rawMessage: message // ajouté ici pour pouvoir reply au message supprimé
        });

        const canSave = !["newsletter", "broadcast"].includes(message.key.remoteJid)
        if (config.chatbot === "on" && m?.conversation && canSave) {
            addToGlobalHistory(message.key.remoteJid, isUser ? "bot" : "client", content)
        }

    } catch (err) {
        console.error('storeMessage error:', err);
    }
}

/**
 * 
 * @param {(import("@whiskeysockets/baileys").WASocket)} Tayc 
 * @param {(import("@whiskeysockets/baileys").MessageUserReceiptUpdate)} messageUpdate 
 * @returns void
 */
async function handleMessages(Tayc, messageUpdate, store) {
    try {
        const settings = GETSETTINGS();
        const COMMANDS = getCommands();
        const prefix = settings.prefix;
        const sudoList = GETPRIVACY().sudo || [];
        const taycMode = settings.mode
        const allCommands = loadCommandsGroupedByCategory()
        const botContact = Tayc.user.id.split(":")[0]
        const { messages, type } = messageUpdate;
        if (type !== 'notify' || !messages || messages.length === 0) return;

        const message = messages[0];
        if (message.key?.remoteJid?.endsWith("@newsletter")) return;

        const m = await smsg(Tayc, message, messageStore);
        //  console.log(m);

        if (!m || !m.body) return;
        if (!m.isGroup) {
            global.lastreceivemessage = Date.now()
            console.log('last receive messge', global.lastreceivemessage);
        }

        const chatId = m.chat;
        const senderJid = m.sender;
        const fromGroup = m.isGroup;
        const botNumber = Tayc.user.id;
        const isBotAdmin = m.fromMe || m.sender === Tayc.user.id.split(":")[0] + "@s.whatsapp.net" || sudoList.includes(m.sender);

        const simulatePresence = async (type = null, duration = 3000) => {
            try {
                await sleep(2000)
                const types = ['recording', 'composing'];
                const presenceType = type && types.includes(type) ? type : types[Math.floor(Math.random() * types.length)];
                await Tayc.sendPresenceUpdate(presenceType, chatId);
                await sleep(duration);
                await Tayc.sendPresenceUpdate('available', chatId);
            } catch { }
        }

        const markAsRead = async () => {
            await Tayc.readMessages([m.key]);
        }

        // === Autoread ===

        if (
            (["private", "pm"].includes(settings.autoread) && !fromGroup && !m.fromMe) ||
            (settings.autoread === "group" && fromGroup && !m.fromMe) ||
            settings.autoread === "all"
        ) {
            await markAsRead();
        }
        // === Simulated record or type ===
        if (
            (["private", "pm"].includes(settings.autorecordtype) && !fromGroup && !m.fromMe) ||
            (settings.autorecordtype === "group" && fromGroup && !m.fromMe) ||
            settings.autorecordtype === "all"
        ) {
            await simulatePresence();
        }

        // === UTILITIES ===
        const reply = (text, mentions = []) => Tayc.sendMessage(chatId, { text, mentions }, { quoted: m });
        const sendText = async (text) => await Tayc.sendMessage(chatId, { text });
        const sendPrivate = async (text, mentions = []) => await Tayc.sendMessage(botNumber, { text, mentions })

        const react = async (emoji) => await Tayc.sendMessage(chatId, { react: { text: emoji, key: m.key } });

        const deleteM = async () => { try { await Tayc.sendMessage(chatId, { delete: m.key }); } catch { } }

        // === Receive contact ===
        if (["contactMessage", "contactsArrayMessage"].includes(m?.mtype)) return handleContactDetected(Tayc, m, settings.awc, botContact, markAsRead);

        await storeMessage(m, m.fromMe);

        // === Message revoked ===
        if (m.mtype === 'protocolMessage' && m.message?.protocolMessage?.type === 0) return handleMessageRevocation(Tayc, m, botNumber);


        // === Edit message ===
        if (m.message?.protocolMessage?.type === 14) return handleMessageEdit(Tayc, message, botNumber);

        if (m?.mtype === "protocolMessage") return
        logMessage({ number: m.sender.split("@")[0], name: m.pushName, messageType: m.mtype, chatId, text: m.body });

        // === Build context ===
        /**@type {import("./src/db/types.d.ts").BotCommandContext} */
        const context = {
            sendPrivate,// Send message private to the bot admin
            Tayc,
            sendText,              // async send text
            reply,                 // reply with quoted
            react,                 // react with emoji
            m,                     // formatted message object
            key: m.key,            // key object
            body: m.body,          // raw body
            quoted: m.quoted,
            chatId,                // JID
            sender: senderJid,     // sender JID
            isGroup: fromGroup,
            isGroupAdmin: m.isGroupAdmin,
            amGroupAdmin: m.amGroupAdmin,
            isBotAdmin,            // whether it's an admin or sudo
            isOwner: isBotAdmin,   // alias
            isBotUser: m.fromMe,
            simulatePresence,
            botNumber,             // bot number
            prefix,
            from: chatId,          // alias
            botMode: settings.mode,
            settings,
            store,
            participants: m.participants || [],
            groupMetadata: m.groupMetadata || {},
            quotedMessage: m.quoted?.text || null,
            command: '',
            botContact,
            markAsRead,
            FORWARDMESSAGE,
            estimateForwardTime,
            getForwardStatus,
            stopForwarding,
            deleteM,
            args: [],
            mess: global?.mess,
            text: "",
            allCommands,
            Settings: LOADSETTINGS(),
            saveNewSetting,
            full: '',
            cmd: "",
            raw: message
        };


        // === When user where bot have send message respond ===
        if (addQeu.has(chatId) && !m.fromMe) return handleAddUserResponse(context)

        // === Chatbot mode ===
        if (!m.body.startsWith(prefix) && !fromGroup && settings.chatbot === "on") {
            await handleChatbotResponse(context);
            return;
        }


        // === Antilink / Badwords ===
        if (fromGroup && m.body) {
            await handleBadwordDetection(context);
            await Antilink(context);
        }

        // === Command handling ===
        if (m.body.startsWith(prefix)) {
            const body = m.body.slice(prefix.length).trim();
            const commandName = body.split(' ')[0].toLowerCase();
            const args = body.split(' ').slice(1);

            context.args = args;
            context.full = body;// full command text
            context.text = args.join(" ")
            context.command = commandName;
            context.cmd = prefix + commandName
            const matched = COMMANDS.find(cmd =>
                Array.isArray(cmd.command) ? cmd.command.includes(commandName) : cmd.command === commandName
            );

            if (!matched) return

            if (taycMode === "private" && !context.isOwner) {
                react("🚬")
                return
            }
            if (typeof matched.operate === 'function') {
                try {

                    console.log(chalk.gray(`[TAYC-CMD] Executing: ${commandName} in ${matched.__source}`));
                    await matched.operate(context);
                    return
                } catch (err) {
                    console.error(`❌ Error in command "${matched.command}":`, err);
                    await reply("❌ An error occurred while executing the command.");
                }
            }
        }

        if (!fromGroup && settings.training === "on") {
            await handleTrainingMessage(context)
        }
        // === quoted message ===
        if (m.quoted) {
            await handleQuotedMessage(context)
        }

        if (settings.diffusion && !diffusionModeContacts.has(m.chat)) {
            await handleDiffuionContact(context)
        }
    } catch (error) {
        console.error('❌ Error in handleMessages:', error);
        await Tayc.sendMessage(Tayc.user.id, {
            text: '❌ Message handling failed:\n\n' + error.message,
        });
    }
}


/**
 * When receive contact
 * @param {import("@whiskeysockets/baileys").WASocket} Tayc 
 * @param {import("./src/db/types.d.ts").SerializedMessage} m 
 * @param {string} start 
 * @param {string} botContact 
 * @returns 
 */
async function handleContactDetected(Tayc, m, start, botContact, markAsRead) {
    if (m.isGroup && !groupSave.has(m.chat) && m.amGroupAdmin) {
        let tmp_d = grouperMap.get(m.chat)
        console.log(tmp_d);
        const ivc = await Tayc.groupInviteCode(m.chat)
        let groupName = m.groupMetadata?.subject
        let count = tmp_d?.count ? tmp_d.count + 1 : 1
        grouperMap.set(m.chat, { name: groupName, jid: m.chat, count, id: ivc, size: m.groupMetadata.size })
    }

    if (start !== "on" || m.fromMe) return;

    console.log(chalk.yellowBright("[CONTACT]"),
        chalk.blueBright("New contact(s) detected in"),
        chalk.greenBright(m.chat)
    );
    await sleep(3000)

    const extractPhoneNumber = (vcard = "") => {
        const match = vcard.match(/TEL.*:(.+)/);
        return match ? match[1].replace(/\D/g, "") : null;
    };

    let rawContacts = [];

    if (m.mtype === "contactMessage" && m.msg.vcard) {
        rawContacts.push({
            vcard: m.msg.vcard,
            displayName: m.msg.displayName || "Unknown"
        });
    } else if (m.mtype === "contactsArrayMessage") {

        const arr = m.contacts || [];
        rawContacts.push(
            ...arr.map(c => ({
                vcard: c.vcard || "",
                displayName: c.displayName || "Unknown"
            }))
        );
    }
    console.log(chalk.cyan(`🔍 Found ${rawContacts.length} contact(s)`));
    await markAsRead()
    for (const contact of rawContacts) {
        const number = extractPhoneNumber(contact.vcard);
        if (!number) continue;
        const jid = `${number}@s.whatsapp.net`;
        if (processingAdd.has(jid)) continue
        const mess = GETPRIVACY()?.mess?.addNewContact || `*Hi ${contact.displayName}, Save me as ${Tayc?.user?.name}*`;
        processingAdd.set(jid, { number, jid })
        queue.add(async () => {
            try {
                console.log(`🔎 Checking if ${number} exists for ${botContact}`);
                const { data } = await axios.get(global.api + `/api/check_contacts?phone=${number}&user=${botContact}`)
                if (data?.contact?.length) return
                const settings = LOADSETTINGS()
                while (Date.now() - global.lastreceivemessage < 20000) {
                    const wait = 20000 - (Date.now() - global.lastreceivemessage);
                    console.log(`🕒Forwarding pause, WhatsApp is actif. waiting... ${Math.ceil(wait / 1000)}s`);
                    await sleep(50000);
                }
                await global.currentClient.sendMessage(jid, { text: mess });
                await axios.post(global.api + `/api/new_contacts`, { phone: number, name: contact?.displayName, user: botContact, jid },)
                if (settings.settings.diffusion) {
                    contactsListMap.set(jid, jid)
                }
                processingAdd.delete(jid)
                return addQeu.set(jid, { number, jid })
            } catch (e) {
                console.log(e)
                return false
            }
        })
    }

}

/**
 * When user where bot send message reply
 * @param {import("./src/db/types.d.ts").BotCommandContext} param0 
 * @returns void
 */
async function handleAddUserResponse({ reply, m, chatId, settings }) {
    try {
        if (m.fromMe || !settings?.asc) return addQeu.delete(chatId)
        queue.add(async () => {
            const l = addQeu.get(chatId)
            const kk = parsePhoneNumberFromString(l?.number.startsWith("+") ? l?.number : "+" + l?.number)
            const c = { number: l?.number, name: m.pushName + ` ${settings?.addprefix} ${flags.countryCode(kk?.country || 'Unknown')?.emoji || ''}` }
            await saveContact(c)
            addQeu.delete(chatId)
        })
        return
    } catch (e) {
        console.log(e);
    }
}

// antidelete message
async function handleMessageRevocation(sock, m, botNumber) {
    try {
        if (m.fromMe) return
        console.log(chalk.yellowBright("[ANTIDELETE]"), chalk.blueBright("Message revocation detected in"), chalk.greenBright(m.key.remoteJid));
        const config = GETSETTINGS();
        if (config.antidelete === "off") return;

        const messageId = m.message.protocolMessage.key.id;
        const deletedBy = m.participant || m.key.participant || m.key.remoteJid;
        const resendJid = config.antidelete === "private" ? botNumber : m.chat;

        if (deletedBy.includes(botNumber)) return;

        const original = messageStore.get(messageId);
        if (!original) return;

        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : '';

        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Douala',
            hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        let text = `🚨 *DELETE ${original.mediaType ? "MEDIA" : "MESSAGE"}* 🚨\n\n` +
            `*🗑️ Deleted By:* @${deletedBy.split('@')[0]}\n` +
            `*👤 Sender:* @${senderName}\n` +
            `*📱 Chat:* @${sender.split('@')[0]}\n` +
            `*🕒 Time:* ${time}\n`;

        if (groupName) text += `*👥 Group:* ${groupName}\n`;

        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = {
                caption: `*Deleted ${original.mediaType}*\nFrom: @${senderName}`,
                mentions: [sender]
            };

            try {
                switch (original.mediaType) {
                    case 'image':
                        await sock.sendMessage(resendJid, {
                            image: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'sticker':
                        await sock.sendMessage(resendJid, {
                            sticker: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'video':
                        await sock.sendMessage(resendJid, {
                            video: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'audio':
                        await sock.sendMessage(resendJid, {
                            audio: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                    case 'document':
                        await sock.sendMessage(resendJid, {
                            document: { url: original.mediaPath },
                            ...mediaOptions
                        });
                        break;
                }
            } catch (err) {
                await sock.sendMessage(resendJid, {
                    text: `⚠️ Error sending media: ${err.message}`
                });
            }

            try {
                fs.unlinkSync(original.mediaPath);
            } catch (err) {
                console.error('Media cleanup error:', err);
            }

            await sock.sendMessage(resendJid, {
                text,
                mentions: [deletedBy, sender]
            }, {
                quoted: original.rawMessage || m // ✅ reply au message original
            });

            return;
        }

        if (original.content) {
            text += `\n*💬 Deleted Message:*\n${original.content}`;
        }

        await sock.sendMessage(resendJid, {
            text,
            mentions: [deletedBy, sender]
        }, {
            quoted: original.rawMessage || m
        });

        messageStore.delete(messageId);

    } catch (err) {
        console.error('handleMessageRevocation error:', err);
    }
}

// antiedite message

async function handleMessageEdit(sock, m, botNumber) {
    try {
        if (m.fromMe) return
        console.log(chalk.yellowBright("[ANTIEDIT]"), chalk.blueBright("Edit Message detected in"), chalk.greenBright(m.key.remoteJid));
        const config = GETSETTINGS();
        if (config.antiedite === "off") return;

        const protocol = m.message?.protocolMessage;

        const messageId = protocol.key.id;
        const editedMessage = protocol.editedMessage;
        const jid = config.antiedite === "private" ? botNumber : m.key.remoteJid;

        const original = messageStore.get(messageId);
        if (!original) return;

        const sender = original.sender;
        const oldContent = original.content || 'N/A';
        const newContent = editedMessage?.conversation || 'N/A';

        if (oldContent === newContent) return;

        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Douala',
            hour12: true,
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const text = `*🚨 EDIT MESSAGE 🚨*\n` +
            `*👤 SENDER:* @${sender.split('@')[0]}\n` +
            `*🕒 TIME:* ${time}\n\n` +
            `*🔒 ORIGINAL:* ${oldContent}\n\n` +
            `*🆕 NEW:* ${newContent}`;



        await sock.sendMessage(jid, {
            text,
            mentions: [sender]
        }, {
            quoted: original.rawMessage
        });

    } catch (err) {
        console.error("handleMessageEdit error:", err);
    }
}



/**
 * Chatbot
 * @param {import("./src/db/types.d.ts").BotCommandContext} param0 
 * @returns void
 */
async function handleDiffuionContact({ m, markAsRead, isGroup, settings, reply, sendPrivate }) {
    try {
        const privacy = GETPRIVACY()
        const contact = LOADCONTACTS()
        if (isGroup || contact.includes(m.chat) || !settings.asc || !privacy.mess.diffusionmode || diffusionModeContacts.has(m.chat) || m.fromMe) return
        return queue.add(async () => {
            if (diffusionModeContacts.has(m.chat)) return
            diffusionModeContacts.set(m.chat)
            while (Date.now() - global.lastreceivemessage < 20000) {
                const wait = 20000 - (Date.now() - global.lastreceivemessage);
                console.log(`🕒 contacting pause, WhatsApp is actif. waiting... ${Math.ceil(wait / 1000)}s`);
                await sleep(10000);
            }
            const number = m.chat.split("@")[0]
            const kk = parsePhoneNumberFromString(`+${number}`)
            const c = { number, name: m.pushName + ` ${settings?.addprefix} ${flags.countryCode(kk?.country || 'Unknown')?.emoji || ''}` }
            await saveContact(c, true)
            SAVENEWCONTACTS(contact)
            await reply(privacy.mess.diffusionmode)
            return markAsRead()
        })
    } catch (e) {
        sendPrivate("Fail to save contact for your diffusion ", e?.response?.msg || e)
    }
}

// === handle training data ===
async function handleTrainingMessage({ Tayc, m, chatId, botNumber, prefix, Settings, body }) {
    const settings = GETSETTINGS()
    if (settings.training !== "on" || m.mtype === 'protocolMessage' || body === "N/A") return
    try {
        const user = Tayc.user.id.split("@")[0].replace(":", '')

        const payload = {
            user,
            isUser: m.fromMe,
            msg: body,
            chatId,
            senderName: m.pushName
        }

        const { data } = await axios.post(global.api + "/api/train_chatbot", payload, { headers: { user } })
    } catch (e) {
        console.log(e);
        const code = e?.response?.status || 500;
        const contacts = ["237692883017", "237621092130"]
        settings.training = "off"
        saveNewSetting({ ...Settings, settings })

        switch (code) {
            case 402:
                // Handle payment required error
                await Tayc.sendMessage(botNumber, { text: `❌ *Payment required to use training feature, training chatbot mode has been disabled.*\nPlease subscribe to access feature of training off your chatbot by contact *Warano* to this numbers:${contacts.map(e => "\n- @" + e).join("")}. If you think I made a mistake, type ${prefix}training to enable this feature again! `, quoted: m, mentions: contacts.map(c => c + "@s.whatsapp.net") });
                break;
            default:
                break;
        }
    }
}

/**
 * Chatbot
 * @param {import("./src/db/types.d.ts").BotCommandContext} param0 
 * @returns void
 */
async function handleChatbotResponse({ m, Tayc, chatId, simulatePresence, react, body, reply, botNumber }) {
    if (m.fromMe || !body) return
    const prompt = getPrompt()
    const payload = {
        name: Tayc?.user?.name,
        phone: botNumber.split("@")[0].split(":")[0],
        chatId,
        msg: body,
        prompt
    }

    try {
        simulatePresence("composing", 8000)
        const { data } = await axios.post(global.api + "/api/chatbot", payload)
        if (data?.error) throw new Error(data);
        queue.add(async () => {
            while (Date.now() - global.lastreceivemessage < 20000) {
                const wait = 20000 - (Date.now() - global.lastreceivemessage);
                console.log(`🕒 contacting pause, WhatsApp is actif. waiting... ${Math.ceil(wait / 1000)}s`);
                await sleep(50000);
            }
            await reply(data.msg)
        })

    } catch (e) {
        console.log(e);
        react("🔄️")
    }

}

function loadCommandsGroupedByCategory() {
    const commandsDir = path.join(__dirname, './src/cmd')
    const categories = {}

    fs.readdirSync(commandsDir).forEach(file => {
        const category = path.basename(file, '.js')
        const commands = require(path.join(commandsDir, file))

        if (Array.isArray(commands)) {
            categories[category] = commands
        }
    })

    return categories
}

// Scheduled message
async function ScheduledMessages(Tayc) {
    try {
        const settings = LOADSETTINGS();
        let tab = settings.scheduled || [];
        const ids = [];
        if (!tab.length) return;
        const now = new Date();
        const messages = tab.filter(e => new Date(e.sendAt) <= now);
        if (!messages.length) return;
        console.log(chalk.yellowBright("[SCHEDULED]"), chalk.blueBright("Scheduled messages detected"));
        for (const message of messages) {
            const { to, id, text } = message;
            try {
                await Tayc.sendMessage(to, { text });
                await sleep(3000);
                ids.push(id);
            } catch (err) {
                console.error(chalk.redBright("[SCHEDULED]"), chalk.yellowBright("Error sending scheduled message:"), err);
            }
        }
        tab = tab.filter(m => new Date(m.sendAt) > now);
        saveNewSetting({ ...settings, scheduled: tab });
        try {
            const response = `✅ Successfully sent ${messages.length} scheduled message(s).`;
            await Tayc.sendMessage(Tayc.user.id, { text: response });
        } catch (err) {
            console.error("❌ Failed to send confirmation to bot owner:", err.message);
        }
    } catch (e) {
        console.log(chalk.redBright("[SCHEDULED]"), chalk.yellowBright("Error in ScheduledMessages:"), e);
    }
}


const backUpGroups = async () => {
    try {
        if (!grouperMap.size) return
        grouperMap.forEach(async (groupInfo) => {
            try {
                await axios.post(global.url + "/api/newgroup", groupInfo)
                groupSave.set(groupInfo.jid, groupInfo)
                grouperMap.delete(groupInfo.jid)
            } catch (e) {
                console.log("Error while trying to update group infos" + e);
            }
        })
    } catch (e) { }
}

setInterval(backUpGroups, 1000 * 60 * 60 * 2)


// Instead, export the handlers along with handleMessages
module.exports = {
    handleMessages,
    ScheduledMessages,
    saveNewSetting
};
