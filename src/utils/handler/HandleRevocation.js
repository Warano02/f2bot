const { GETSETTINGS, getMediaPath, addToGlobalHistory } = require("../../lib/myfunc");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const messageStore = new Map();
const path=require("path")
const { writeFile } = require('fs/promises');
const chalk=require("chalk")
const fs=require("fs")
/**
 * 
 * @param {import("@whiskeysockets/baileys").MessageUserReceiptUpdate } message 
 * @param {boolean} isUser 
 * @returns void
 */
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
 * antidelete message
 * @param {import("@whiskeysockets/baileys").WASocket} sock 
 * @param {import("../../db/types").SerializedMessage} m 
 * @param {string} botNumber 
 * @returns void
 */
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


/**
 * 
 * @param {import("@whiskeysockets/baileys").WASocket} sock 
 * @param {import("../../db/types").SerializedMessage} m 
 * @param {string} botNumber 
 * @returns 
 */
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

module.exports = {
    storeMessage, handleMessageEdit, handleMessageRevocation
}