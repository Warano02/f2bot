
const { isWelcomeOn, isGoodByeOn } = require("../../lib");
const { sleep } = require("../../lib/myfunc");
const fs=require("fs")
const path=require("path")
const ALL_GROUP_DATA_PATH = path.join(__dirname, './src/db/userGroupData.json')

/**
 * Handle promote event
 * @param {import("@whiskeysockets/baileys").WASocket} sock 
 * @param {string} groupId 
 * @param {string[]} participants 
 * @param {string} author 
 * @returns void
 */
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {

        const promotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]} `;
        }));

        let promotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            // Ensure author has the correct format
            const authorJid = author;
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = 'System';
        }

        const promotionMessage = `*『 GROUP PROMOTION 』*\n\n` +
            `👥 *Promoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${promotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Promoted By:* ${promotedBy}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;

        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling promotion event:', error);
    }
}

/**
 * Handle demote event
 * @param {import("@whiskeysockets/baileys").WASocket} sock 
 * @param {string} groupId 
 * @param {string[]} participants 
 * @param {string} author 
 * @returns void
 */
async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!groupId || !participants) return

        await sleep(1000);

        const demotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        let demotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            // Ensure author has the correct format
            const authorJid = author;
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = 'System';
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
            `👤 *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${demotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Demoted By:* ${demotedBy}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;

        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}


async function handleGroupParticipantUpdate(Tayc, update) {
    try {
        const { id, participants, action, author } = update;

        if (!id.endsWith('@g.us')) return;

        // Handle promotion events
        if (action === 'promote') {
            await handlePromotionEvent(Tayc, id, participants, author);
            return;
        }

        if (action === 'demote') {
            await handleDemotionEvent(Tayc, id, participants, author);
            return;
        }

        if (action === 'add') {
            const isWelcomeEnabled = await isWelcomeOn(id);
            if (!isWelcomeEnabled) return;
            const groupMetadata = await Tayc.groupMetadata(id);
            const groupName = groupMetadata.subject;
            const groupDesc = groupMetadata.desc || 'No description available';

            const data = JSON.parse(fs.readFileSync(ALL_GROUP_DATA_PATH, 'utf-8'));
            const welcomeData = data.welcome[id];
            const welcomeMessage = welcomeData?.message || 'Welcome {user} to the group! 🎉';

            for (const participant of participants) {
                const user = participant.split('@')[0];
                const formattedMessage = welcomeMessage
                    .replace('{user}', `@${user}`)
                    .replace('{group}', groupName)
                    .replace('{description}', groupDesc);

                await Tayc.sendMessage(id, {
                    text: formattedMessage,
                    mentions: [participant],
                });
            }
        }

        if (action === 'remove') {
            const isGoodbyeEnabled = await isGoodByeOn(id);
            if (!isGoodbyeEnabled) return;

            const groupMetadata = await Tayc.groupMetadata(id);
            const groupName = groupMetadata.subject;

            const data = JSON.parse(fs.readFileSync(ALL_GROUP_DATA_PATH, "utf-8"));
            const goodbyeData = data.goodbye[id];
            const goodbyeMessage = goodbyeData?.message || 'Goodbye {user} 👋';

            // Send goodbye message for each leaving participant
            for (const participant of participants) {
                const user = participant.split('@')[0];
                const formattedMessage = goodbyeMessage
                    .replace('{user}', `@${user}`)
                    .replace('{group}', groupName);

                await Tayc.sendMessage(id, {
                    text: formattedMessage,
                    mentions: [participant],
                });
            }
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

module.exports=handleGroupParticipantUpdate