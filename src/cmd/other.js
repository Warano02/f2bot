const axios = require("axios")
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
        desc: "Show the bot deployment method via git or website",
        operate: async ({ m, Tayc, reply }) => {
            try {
                const { data } = await axios.get('https://api.github.com/repos/warano02/tayc');
                const repoInfo = `
        *🔄️ BOT REPOSITORY 🔄️*
        
🧱 *Name:* ${data.name}
🧱 *Stars:* ${data.stargazers_count}
🧱 *Forks:* ${data.forks_count}
🧱 *GitHub Link:* 
https://github.com/warano02/tayc

@${m.sender.split("@")[0]}👋, Don't forget to star and fork my repository!`;

                Tayc.sendMessage(m.chat, {
                    text: repoInfo.trim(),
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: "Tayc Repository",
                            thumbnail: "https://i.ibb.co/rKbXNwg5/Chat-GPT-Image-Jul-24-2025-09-26-56-AM.png",
                            mediaType: 1
                        }
                    }
                }, { quoted: m });
            } catch (error) {
                console.log(error);

                reply('❌ *Error fetching repository details.*');
            }
        }
    },
]