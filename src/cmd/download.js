
const axios = require('axios');
const { sleep } = require('../../lib/myfunc');
module.exports = [
    {
        command: ["tiktok", "tkt"],
        desc: "Download a tiktok video",
        operate: async ({ reply, Tayc, m, react, text, cmd }) => {
            if (!text) return reply(`*Provide the tiktok video link*. *Exemple*.\n> ${cmd} <Link>`)
            if (global.tktd) return react("🚨")
            let ma = 3
            let i = 0
            global.tktd = true
            while (i <= ma && global.tktd) {
                console.log("Try to download tiktok video: " + i);

                try {
                    const q = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${text}`)
                    console.log(q.data);
                    const res = q.data
                    if (res?.data?.title && res?.data?.video) {
                        await Tayc.sendMessage(m.chat, { caption: res.data?.title || "*No legend*", video: { url: res.data?.video }, fileName: "video.mp4", mimetype: "video/mp4", }, { quoted: m });
                    }
                } catch (e) {
                    await sleep(5000)
                    console.log(e);
                } finally {
                    i++
                }
            }
            if (i > ma) {
                react("❌")
                reply("❌*Try again later*")
            }
            global.tktd = false
        }
    }
]