const axios = require("axios");
const { runtime } = require("../../lib/myfunc");
module.exports = [
    {
        command: ['ping', 'p'],
        desc: "Test if bot is still connected",
        operate: async ({ m, Tayc, botname = "Tayc" }) => {
            const startTime = performance.now();

            try {
                const sentMessage = await Tayc.sendMessage(m.chat, {
                    text: "🚬 Pong!",
                    contextInfo: { quotedMessage: m.message }
                });

                const endTime = performance.now();
                const latency = `${(endTime - startTime).toFixed(2)} ms`;

                await Tayc.sendMessage(m.chat, {
                    text: `*🤞 ${botname} Speed:* ${latency}`,
                    edit: sentMessage.key,
                    contextInfo: { quotedMessage: m.message }
                });

            } catch (error) {
                console.error('Error sending ping message:', error);
                await Tayc.sendMessage(m.chat, {
                    text: 'An error occurred while trying to ping.',
                    contextInfo: { quotedMessage: m.message }
                });
            }
        }
    },
    {
        command: ['repo', 'repository'],
        desc: "Show the bot deployment method via GitHub",
        operate: async ({ m, Tayc, reply }) => {
            try {
                const { data } = await axios.get('https://api.github.com/repos/warano02/tayc');

                const repoInfo = `
*🔄 BOT REPOSITORY 🔄*

📦 *Name:* ${data.name}
⭐ *Stars:* ${data.stargazers_count}
🍴 *Forks:* ${data.forks_count}
🔗 *GitHub:* https://github.com/warano02/tayc

👋 @${m.sender.split("@")[0]}, don’t forget to ⭐ star & 🍴 fork the repo!
            `.trim();

                await Tayc.sendMessage(m.chat, {
                    text: repoInfo,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: "Tayc WhatsApp Bot",
                            body: "Click to view source code",
                            mediaType: 1,
                            thumbnailUrl: "https://i.ibb.co/rKbXNwg5/Chat-GPT-Image-Jul-24-2025-09-26-56-AM.png",
                            sourceUrl: "https://github.com/warano02/tayc"
                        }
                    }
                }, { quoted: m });

            } catch (error) {
                console.error("Error fetching GitHub repo:", error);
                reply('❌ *Error fetching repository details.*');
            }
        }
    },
    {
        command: ['runtime', 'uptime'],
        desc: "Give a bot uptime",
        operate: async ({ reply }) => {
            const botUptime = runtime(process.uptime());
            reply(`*🔹 ${botUptime}*`);
        }
    },

]