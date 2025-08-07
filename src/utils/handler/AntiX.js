const { getAntiBadword, incrementWarningCount, getAntilink } = require("../../lib/index.js");
const { loadAntibadwordConfig } = require("../../lib/myfunc2.js");

/**
 * Anti badword
 * @param {import("../../db/types.d.ts").BotCommandContext} param0 
 * @returns void
 */
async function handleBadwordDetection({ Tayc, chatId, body, amGroupAdmin, deleteM, sender, reply, Settings, isBotUser, isGroupAdmin }) {
    if (isBotUser || isGroupAdmin || !amGroupAdmin || !body) return;
    const [config, antiBadwordConfig] = await Promise.all([
        loadAntibadwordConfig(chatId),
        getAntiBadword(chatId, 'on')
    ]);
    if (!config?.enabled || !antiBadwordConfig?.enabled) return;
    const badWords = Settings.badWords || [];
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`\\b(${badWords.map(escapeRegExp).join('|')})\\b`, 'i');
    const containsBadWord = pattern.test(body);
    if (!containsBadWord) return;

    await deleteM();

    const mentionTag = `@${sender.split('@')[0]}`;
    const mentionList = [sender];

    const kickUser = async () => {
        try {
            await Tayc.groupParticipantsUpdate(chatId, [sender], 'remove');
            await Tayc.sendMessage(chatId, {
                text: `*${mentionTag} has been kicked for using bad words*`,
                mentions: mentionList
            });
        } catch (err) {
            console.error('❌ Error kicking user:', err);
        }
    };

    switch (antiBadwordConfig.action) {
        case 'delete':
            await reply(`*${mentionTag} bad words are not allowed here*`, mentionList);
            break;

        case 'kick':
            await kickUser();
            break;

        case 'warn':
            const warningCount = await incrementWarningCount(chatId, sender);
            if (warningCount >= 3) {
                await kickUser();
            } else {
                await Tayc.sendMessage(chatId, {
                    text: `*${mentionTag} warning ${warningCount}/3 for using bad words*`,
                    mentions: mentionList
                });
            }
            break;
    }
}

/**
 * Anti Links
 * @param {import("../../db/types.d.ts").BotCommandContext} param0 
 * @returns void
 */
async function Antilink({ Tayc, body, sender, reply, deleteM, isBotUser, chatId, amGroupAdmin, isGroupAdmin }) {
    if (isBotUser || isGroupAdmin || !amGroupAdmin || !body) return;
    const whiteListLinks = ['youtube.com', 't.me/', 'sapjasha.com', 'wa.me/', 'whatsapp.com/'];
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
    const hasLink = linkRegex.test(body);

    if (!hasLink || whiteListLinks.some(link => body.includes(link))) return;

    const antilinkConfig = await getAntilink(chatId, 'on');
    if (!antilinkConfig) return;

    await deleteM();

    const mentionTag = `@${sender.split('@')[0]}`;
    const mentionList = [sender];

    const kickUser = async () => {
        try {
            await Tayc.groupParticipantsUpdate(chatId, [sender], 'remove');
            await Tayc.sendMessage(chatId, {
                text: `*${mentionTag} has been kicked for using bad words*`,
                mentions: mentionList
            });
        } catch (err) {
            console.error('❌ Error kicking user:', err);
        }
    };

    switch (antilinkConfig.action) {
        case 'delete':
            await reply(`*${mentionTag} links are not allowed here*`, mentionList);
            break;

        case 'kick':
            await kickUser();
            break;

        case 'warn':
            const warningCount = await incrementWarningCount(chatId, sender);
            if (warningCount >= 3) {
                await kickUser();
            } else {
                await Tayc.sendMessage(chatId, {
                    text: `*${mentionTag} warning ${warningCount}/3 for using bad words*`,
                    mentions: mentionList
                });
            }
            break;
    }
}

module.exports={handleBadwordDetection,Antilink}