const axios = require("axios");
const { sleep } = require("../../lib/myfunc");

module.exports = [
    {
        command: ["tiktok", "tkt"],
        desc: "Download a TikTok video",
        operate: async ({ reply, Tayc, m, react, text, cmd }) => {
            if (!text) return reply(`*Provide a valid TikTok link.*\n\n*Example:*\n> ${cmd} https://vm.tiktok.com/xxx`);

            if (global.tktd) return react("🚨");

            global.tktd = true;
            let attempts = 0;
            const maxAttempts = 3;

            react("⏳");
            while (attempts < maxAttempts) {
                try {
                    const { data } = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${encodeURIComponent(text)}`);

                    if (data?.data?.video) {
                        await Tayc.sendMessage(m.chat, {
                            video: { url: data.data.video },
                            caption: data.data.title || "🎵 TikTok Video",
                            mimetype: "video/mp4",
                            fileName: "video.mp4"
                        }, { quoted: m });

                        react("✅");
                        break;
                    } else {
                        throw new Error("No video found in response");
                    }

                } catch (err) {
                    console.log(`❌ Attempt ${attempts + 1} failed:`, err.message || err);
                    await sleep(3000)
                    attempts++;
                }
            }

            if (attempts === maxAttempts) {
                react("❌");
                reply("❌ *Failed to download the TikTok video. Please try again later.*");
            }

            global.tktd = false;
        }
    }
]