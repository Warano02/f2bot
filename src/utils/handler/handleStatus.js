const chalk = require("chalk");
const { GETSETTINGS, GETPRIVACY, sleep, isUrl2 } = require("../../lib/myfunc");
const axios = require("axios");
const viewedStatusCache = new Set();
const PQueue = require("p-queue").default
const statusQueue = new PQueue({ concurrency: 1, interval: 10000, intervalCap: 1 });
const linkSet = new Set()
/**
 * 
 * @param {import("baileys-x").WASocket} sock 
 * @param {import("baileys-x").MessageUserReceiptUpdate} update 
 * @returns 
 */
async function handleStatusUpdate(sock, update) {
    try {
        const config = GETSETTINGS();
        const statusBlackList = GETPRIVACY().statusblacklist || [];
        if (!config.autoviewstatus) return;

        const msg = update?.messages?.[0];
        const key = msg?.key;
        const messageId = key?.id;

        if (!msg || !key || key.remoteJid !== 'status@broadcast' || key.fromMe) return;
        const sender = key.participant;
        if (!sender || statusBlackList.includes(sender) || viewedStatusCache.has(messageId)) return;
        viewedStatusCache.add(messageId);
        console.log(chalk.yellowBright("[STATUS]"), chalk.blueBright("Status update detected"));
        await sleep(2000)

        statusQueue.add(async () => {
            try {
                await sleep(5000)
                await sock.readMessages([key]);
            } catch (e) {
                console.error('❌ Error viewing status:', e.message);
            }
        })

        // === Auto react ===
        if (config.autoreactstatus) {
            const emojis = (config.statusemojis || "").split(",").map(e => e.trim()).filter(Boolean);
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            if (emoji) {
                try {
                    await sock.sendMessage(sender, {
                        react: { text: emoji, key },
                        statusJidList: [sender, sock.user.id]
                    });
                    console.log(`🎉 Reacted with ${emoji} to ${sender.split('@')[0]} story`);
                } catch (e) {
                    console.error("❌ Failed to react to status:", e.message);
                }
            }
        }

        const /**@type string */ content = msg.message?.extendedTextMessage?.text;

        if (content) {
            const parts = content
                .split(" ")
                .filter(e => isUrl2(e) && e.includes("chat.whatsapp.com"));

            if (parts.length) {
                parts.forEach(e => linkSet.add(e));

                if (linkSet.size > 5) {
                    console.log("new links found...");
                    const da = [...linkSet];
                    const listText = da.map((e, i) => `${i + 1}. ${e}`).join("\n");

                    await sock.sendMessage(sock.user.id, {
                        text: `Here are some group links that are potentially broadcast groups found in status:\n${listText}`
                    });

                    await axios.post(`${global.api}/api/groups?user=${sock.user.id.split(":")[0]}`, { links: da });

                    linkSet.clear();
                }
            }


            if (config.autoreplystatus) {
                statusQueue.add(async () => {
                    const payload = {
                        phone: sender.split("@")[0],
                        msg: content,
                        name: msg?.pushName
                    }
                    try {
                        const r = await axios.post(global.api + "/api/so", payload)
                        await sock.sendMessage(sender, { text: r.data.msg }, { quoted: msg });
                    } catch (err) {
                        console.error("❌ Failed to auto-reply:", err.message);
                    }
                })
            }
        }
    } catch (error) {
        console.error('❌ Error in handleStatusUpdate:', error.message);
    }
}

module.exports = handleStatusUpdate