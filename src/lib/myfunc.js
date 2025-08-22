

const {
    proto,
    delay,
    getContentType,
    downloadMediaMessage
} = require("baileys-x")
const chalk = require('chalk')
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const moment = require('moment-timezone')
const {
    sizeFormatter
} = require('human-readable')
const util = require('util')
const Jimp = require('jimp')
const path = require('path')

const { parsePhoneNumberFromString } = require('libphonenumber-js');
const flags = require('emoji-flags');
const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)
const TEMP_MEDIA_DIR = path.join(__dirname, '../../tmp');
const ALL_CHAT_PATH = path.join(__dirname, '../db/chats.json');
const ALL_SETTINGS_PATH = path.join(__dirname, '../db/settings.json');
const ContactsList = new Set()

if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

exports.unixTimestampSeconds = unixTimestampSeconds

exports.generateMessageTag = (epoch) => {
    let tag = (0, exports.unixTimestampSeconds)().toString();
    if (epoch)
        tag += '.--' + epoch; // attach epoch if provided
    return tag;
}

exports.processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.getBuffer = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.getImg = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.runtime = function (seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

exports.clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

/**
 * 
 * @param {number} ms 
 * @returns void
 */
exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param {string} url 
 * @returns boolean
 */
exports.isUrl2 = (url) => {
    return typeof url === 'string' && /^https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/i.test(url);
};

exports.isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

exports.getTime = (format, date) => {
    if (date) {
        return moment(date).locale('id').format(format)
    } else {
        return moment.tz('Asia/Jakarta').locale('id').format(format)
    }
}

exports.formatDate = (n, locale = 'id') => {
    let d = new Date(n)
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })
}

exports.tanggal = (numer) => {
    const myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const myDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const tgl = new Date(numer);
    const day = tgl.getDate();
    const bulan = tgl.getMonth();
    let thisDay = tgl.getDay();
    thisDay = myDays[thisDay];
    const yy = tgl.getYear();
    const year = (yy < 1000) ? yy + 1900 : yy;
    const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss');
    const d = new Date();
    const locale = 'id';
    const gmt = new Date(0).getTime() - new Date('1 January 1970').getTime();
    const weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5];

    return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
}

exports.jam = (numer, options = {}) => {
    let format = options.format ? options.format : "HH:mm"
    let jam = options?.timeZone ? moment(numer).tz(timeZone).format(format) : moment(numer).format(format)

    return `${jam}`
}

exports.formatp = sizeFormatter({
    std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

exports.json = (string) => {
    return JSON.stringify(string, null, 2)
}

function format(...args) {
    return util.format(...args)
}

exports.logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp)
        if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

exports.generateProfilePicture = async (buffer) => {
    const jimp = await Jimp.read(buffer)
    const min = jimp.getWidth()
    const max = jimp.getHeight()
    const cropped = jimp.crop(0, 0, min, max)
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    }
}

exports.bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

exports.getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path)
                .then((res) => {
                    let length = parseInt(res.headers['content-length'])
                    let size = exports.bytesToSize(length, 3)
                    if (!isNaN(length)) resolve(size)
                })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = exports.bytesToSize(length, 3)
            if (!isNaN(length)) resolve(size)
        } else {
            reject('error gatau apah')
        }
    })
}

exports.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

exports.getGroupAdmins = (participants) => {
    let admins = []
    for (let i of participants) {
        i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ''
    }
    return admins || []
}


/**
 * Parse un fichier .vcf et ajoute nom, numéro, pays, flag
 * @param {Buffer|string} vcfData 
 * @returns {Contacts}
 */
function parseVcard(vcfData) {
    let text = Buffer.isBuffer(vcfData) ? vcfData.toString() : vcfData;

    // Nettoyage de base
    text = text.replace(/^\uFEFF/, '').trim();

    const cards = text.split(/END:VCARD\s*/).filter(Boolean);
    const results = [];

    for (let rawCard of cards) {
        rawCard = rawCard.trim();
        if (!rawCard.includes('BEGIN:VCARD')) continue;

        const lines = rawCard.split(/\r?\n/).map(line => line.trim());
        let name = 'Unknown';
        let tels = [];

        for (const line of lines) {
            if (line.startsWith('FN:')) {
                name = line.slice(3).trim();
            }
            if (line.startsWith('TEL')) {
                const parts = line.split(':');
                const number = parts[1]?.trim();
                if (number) tels.push(number);
            }
        }

        for (const raw of tels) {

            const phone = parsePhoneNumberFromString(raw.startsWith("+") ? raw : "+" + raw);

            const country = phone?.country || 'Unknown';
            const code = phone?.countryCallingCode ? `+${phone.countryCallingCode}` : 'Unknown';
            const flag = flags.countryCode(country)?.emoji || '';

            results.push({ name, number: raw, country, countryCode: code, flag });
        }
    }

    return results;
}

exports.parseVcard = parseVcard;


/**
 * Serialize Message
 * @param {import("baileys-x").WASocket} TaycInc
 * @param {import("baileys-x").MessageUserReceiptUpdate} m
 * @param {import('../db/types.d.js').Store} store
 * @returns {import("../db/types.d.ts").SerializedMessage} 
 */
exports.smsg = async (TaycInc, m, store) => {
    if (!m) return m
   
    let M = proto.WebMessageInfo
    const botJid = TaycInc.user.id.split(":")[0] + "@s.whatsapp.net"
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid

        m.isGroup = m.chat.endsWith('@g.us')
        if (m.isGroup && m.key.participant) {
            const groupMetadata = await TaycInc.groupMetadata(m.chat)
            m.groupMetadata = groupMetadata
            const participant = groupMetadata.participants.find(p => p.id === m.key.participant || p.lid === m.key.participant)
            m.sender = participant?.jid
            m.groupAdmin = groupMetadata.participants.filter(el => el.admin !== null).map(e => e.jid)
            m.isGroupAdmin = m.groupAdmin.includes(m.sender)
            m.amGroupAdmin = m.groupAdmin.includes(botJid)
        } else {
            m.sender = m.key.remoteJid
        }
        m.fromMe = m.key.fromMe || m.sender === botJid
    }
    

    if (m.message) {
        m.mtype = getContentType(m.message)
        const content = m.message?.[m.mtype]
        
        if (["viewOnceMessage", "viewOnceMessageV2", "viewOnceMessageV2Extension"].includes(m.mtype)) {
            const inner = content?.message
            const innerType = inner && Object.keys(inner)[0]
            m.msg = inner?.[innerType] || {}
        } else if (m.mtype === 'contactMessage') {
            m.msg = content || {}
        } else if (m.mtype === 'contactsArrayMessage') {
            m.contacts = content?.contacts || []
            m.msg = m.contacts[0] || {}
        } else {
            m.msg = content || {}
        }

        m.body =
            m.message.conversation ||
            m.msg.caption ||
            m.msg.text ||
            (m.mtype === 'listResponseMessage' && m.msg.singleSelectReply?.selectedRowId) ||
            (['contactMessage', 'contactsArrayMessage'].includes(m.mtype) && 'contact message') ||
            (m.mtype === 'buttonsResponseMessage' && m.msg.selectedButtonId) ||
            (["viewOnceMessage", "viewOnceMessageV2", "viewOnceMessageV2Extension"].includes(m.mtype) && m.msg.caption) ||
            (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(m.mtype) && 'media message') ||
            (m.mtype === 'protocolMessage' && 'N/A') ||
            'N/A'

        // Gestion du message cité
        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

        if (quoted) {
            let type = getContentType(quoted)

            let quotedMsg = quoted[type]

            if (['productMessage'].includes(type)) {
                type = getContentType(quotedMsg)
                quotedMsg = quotedMsg[type]
            }

            if (typeof quotedMsg === 'string') quotedMsg = { text: quotedMsg }

            m.quoted = quotedMsg
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id?.startsWith('BAE5') && m.quoted.id.length === 16
            m.quoted.sender = TaycInc.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === TaycInc.user?.id
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = m.msg.contextInfo.mentionedJid || []

            // Ajout VCF parser
            const quotedMessageFull = {
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            }

            const vM = proto.WebMessageInfo.fromObject(quotedMessageFull)

            m.quoted.fakeObj = vM
            m.quoted.delete = () => TaycInc.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => TaycInc.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = async () => await downloadMediaMessage(vM, 'buffer', {}, { reuploadRequest: TaycInc.updateMediaMessage })

            const mimetype = quoted?.documentMessage?.mimetype?.toLowerCase() || '';
            const isVcf = mimetype.includes('vcard');

            if (isVcf) {
                try {
                    const buffer = await downloadMediaMessage(vM, 'buffer', {}, {
                        reuploadRequest: TaycInc.updateMediaMessage
                    })

                    const content = buffer.toString()
                    m.quoted.vcf = parseVcard(content)
                    console.log(m.quoted.vcf);

                } catch (e) {
                    console.error('❌ Failed to parse quoted VCF file:', e.message)
                    m.quoted.vcf = null
                }
            }

            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                const q = await store.loadMessage(m.chat, m.quoted.id, TaycInc)
                return exports.smsg(TaycInc, q, store)
            }
        }
    }

    if (m.msg?.url) m.download = () => TaycInc.downloadMediaMessage(m.msg)
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''

    m.reply = (text, chatId = m.chat, options = {}) =>
        Buffer.isBuffer(text)
            ? TaycInc.sendMedia(chatId, text, 'file', '', m, options)
            : TaycInc.sendText(chatId, text, m, options)

    m.copy = () => exports.smsg(TaycInc, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
        TaycInc.copyNForward(jid, m, forceForward, options)

    return m
}

exports.reSize = (buffer, ukur1, ukur2) => {
    return new Promise(async (resolve, reject) => {
        var baper = await Jimp.read(buffer);
        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG)
        resolve(ab)
    })
}


/**
 * 
 * @returns {import("../db/types.d.ts").Settings}
 */
exports.GETSETTINGS = () => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/settings.json'), 'utf-8'))
        return data.settings
    } catch {
        return {}
    }
}

/**
 * 
 * @returns {import("../db/types.d.ts").BotSettings}
 */
exports.LOADSETTINGS = () => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/settings.json'), 'utf-8'))
        return data
    } catch {

        return {}
    }
}

/**
 * 
 * @returns {import("../db/types.d.ts").Privacy}
 */
exports.GETPRIVACY = () => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/settings.json'), 'utf-8'))
        const { settings, ...value } = data
        return value
    } catch {
        return {}
    }
}

/**
 * 
 * @returns {[string]} - Array of jid 
 */
exports.LOADCONTACTS = () => Array.from(ContactsList, e => e + "@s.whatsapp.net");

/**
 * 
 * @param {string} contact -  the phone number not a jid 
 * @returns void
 */

exports.SAVENEWCONTACTS = (contact) => {
    ContactsList.add(contact)
    console.log(contact, "save successfully !");
};

exports.SETCONTACTSLIST = async () => {
    try {
        const { data } = await axios.get(`${global.api}/google/contacts/list?token=${global.contact_key}`);
        const contacts = data?.contacts || [];
        contacts.forEach(c => {
            if (c.number) ContactsList.add(c.number.replace(/[\s+-]/g, "")); 
        });
        console.log(`${ContactsList.size} contacts loaded successfully!`);
        return true;
    } catch (e) {
        console.error("Failed to load contacts:", e);
        const s = exports.LOADSETTINGS();
        s.settings.diffusion = false;
        exports.saveNewSetting(s);
        return false;
    }
};


/**
 * 
 * @param {string} folderPath 
 * @returns number
 */
const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }
        return totalSize / (1024 * 1024);
    } catch (err) {
        console.error('Error getting folder size:', err);
        return 0;
    }
};

exports.getFolderSizeInMB = getFolderSizeInMB

/**
 * 
 * @returns string - the prompt of user
 */
exports.getPrompt = () => {
    const promptFile = path.join(__dirname, '../../prompt.txt');
    const defaultPrompt = "You are a helpful assistant.";
    try {
        if (fs.existsSync(promptFile)) {
            return fs.readFileSync(promptFile, 'utf8');
        } else {
            return defaultPrompt;
        }
    } catch (err) {
        console.error("Erreur lecture du prompt :", err);
        return defaultPrompt;
    }
}

/**
 * 
 * @param {string} messageId 
 * @param {string} ext 
 * @returns string
 */
function getMediaPath(messageId, ext) {
    const day = new Date().toISOString().slice(0, 10);
    const dayDir = path.join(TEMP_MEDIA_DIR, day);
    if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });
    return path.join(dayDir, `${messageId}${ext}`);
}

function loadAllChats() {
    try {
        const raw = fs.readFileSync(ALL_CHAT_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

exports.loadAllChats = loadAllChats

/**
 * 
 * @param {Object} data 
 */
function saveAllChats(data) {
    fs.writeFileSync(ALL_CHAT_PATH, JSON.stringify(data, null, 2));
}

exports.saveAllChats = saveAllChats

/**
 * 
 * @param {object} newSettings 
 */
exports.saveNewSetting = (newSettings) => {
    fs.writeFileSync(ALL_SETTINGS_PATH, JSON.stringify(newSettings, null, 2));
}

/**
 * 
 * @param {string} jid 
 * @param {string} role 
 * @param {string} text 
 */
function addToGlobalHistory(jid, role, text) {
    const allChats = loadAllChats();
    if (!allChats[jid]) allChats[jid] = [];
    allChats[jid].push({
        role,
        text,
        timestamp: new Date().toISOString()
    });
    if (allChats[jid].length > 20) allChats[jid].shift();
    saveAllChats(allChats);
}

exports.addToGlobalHistory = addToGlobalHistory
exports.getMediaPath = getMediaPath

exports.loadCommandsGroupedByCategory = () => {
    const commandsDir = path.join(__dirname, '../cmd')
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

const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        if (sizeMB > 100) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
                else fs.rmSync(filePath, { recursive: true, force: true });
            }
        }
    } catch (err) {
        console.error('Temp cleanup error:', err);
    }
};

setInterval(cleanTempFolderIfLarge, 60 * 1000);