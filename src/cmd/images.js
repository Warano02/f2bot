const { default: axios } = require("axios");
const { remini } = require("../lib/remini");
const { wikimedia } = require("../services/scraper.service");
const { uploadImage } = require("../lib/uploadImage");

module.exports = [
    {
        command: ['remini', 'enhance', 'hd'],
        desc: "Modify image quality",
        operate: async ({ m, prefix, command, Tayc, mess, reply }) => {
            const quoted = m.quoted ? m.quoted : null || m.msg;
            const mime = quoted?.mimetype || "";

            if (!quoted) return reply("📌 *Send or reply to an image.*");
            if (!/image/.test(mime)) return reply(`📌 *Send or reply to an image with caption:* ${prefix + command}`);

            try {
                const media = await m.quoted.download();
                if (!media) return reply("❌ *Failed to download media. Try again.*");

                const enhancedImage = await remini(media, 'enhance');
                await Tayc.sendMessage(m.chat, { image: enhancedImage, caption: "*Image enhanced successfully*" }, { quoted: m });
            } catch (error) {
                console.error(error);
                reply("❌ *An error occurred while enhancing the image.*");
            }
        }
    },
    {
        command: ['wikimedia'],
        desc: "Search image to wikimedia",
        operate: async ({ m, text, Tayc, reply, react }) => {
            if (!text) return reply("📌 *Enter a search query.*");

            try {
                await react("⌛")
                const results = await wikimedia(text);
                if (!results.length) return reply("❌ *No Wikimedia results found.*");

                const randomWiki = results[0];
                await Tayc.sendMessage(
                    m.chat,
                    {
                        caption: `📌 *Title:* ${randomWiki.title}\n🔗 *Source:* ${randomWiki.source}\n🖼️ *Media URL:* ${randomWiki.image}`,
                        image: { url: randomWiki.image }
                    },
                    { quoted: m }
                );
            } catch (error) {
                console.error(error);
                reply("❌ *An error occurred while fetching Wikimedia results.*");
            } finally {
                react("")
            }
        }
    },
    {
        command: ["removebackround", "rmbg"],
        desc: "Remove the image background",
        operate: async ({ react, m, text, cmd, Tayc, reply }) => {
            if (!text) return reply(`*Please enter the link of your image.*\nExp: ${cmd} https://i.ibb.co/HX2myZs/azaa.jpg `)
            if (!/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/.test(text)) return reply('Enter a valid image link')
            try {
                await react("⌛")
                const response = await axios.get(`https://okatsu-rolezapiiz.vercel.app/tools/removebg?url=${text}`, {
                    responseType: 'arraybuffer',
                    timeout: 15000
                })
                await Tayc.sendMessage(m.chat, { image: Buffer.from(response.data), caption: "Your image withoout Background " })
            } catch (error) {
                console.error(error);
                reply("❌ *An error occurred while enhancing the image.*");
            } finally {
                react("")
            }
        }
    }
]