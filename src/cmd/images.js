const { remini } = require("../lib/remini");

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
]