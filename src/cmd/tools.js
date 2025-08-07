const axios = require("axios");
const fs = require("fs")
const path=require("path")
const { exec } = require('child_process');
const { getRandom } = require("../lib/myfunc");

module.exports = [
    {
        command: ['tinyurl', 'shortlink'],
        desc: "A fast link shortener for more professional links",
        operate: async ({ m, text, cmd, reply }) => {
            if (!text) return reply(`*Example: ${cmd} https://instagram.com/your_name*`);

            try {
                const response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
                reply(response.data);
            } catch (error) {
                console.error(error);
                reply('*An error occurred while shortening the URL.*');
            }
        }
    },
    {
        command: ['toimage', 'toimg'],
        desc: "Convert stickers to image",
        operate: async ({ Tayc, m, reply,cmd }) => {
            const quoted = m.quoted || m.msg?.quoted;
            const mime = quoted?.mimetype || quoted?.msg?.mimetype;
            if (!quoted || !/webp/.test(mime)) return reply(`*Reply to a sticker with the caption ${cmd}*`);
            try {
                const media = await quoted.download();
                const inputPath = path.join(__dirname, getRandom('.webp'));
                fs.writeFileSync(inputPath, media);
                const outputPath = path.join(__dirname, getRandom('.png'));
                exec(`ffmpeg -i ${inputPath} ${outputPath}`, (err) => {
                    fs.unlinkSync(inputPath);
                    if (err) {
                        console.error('Error converting to image:', err);
                        return reply('An error occurred while converting the sticker to an image.');
                    }
                    const buffer = fs.readFileSync(outputPath);
                    Tayc.sendMessage(m.chat, { image: buffer }, { quoted: m });
                    fs.unlinkSync(outputPath);
                });
            } catch (error) {
                console.error('Error converting to image:', error);
                reply('An error occurred while converting the sticker to an image.');
            }
        }
    },
]