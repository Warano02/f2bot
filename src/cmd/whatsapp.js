const fs = require('fs');
const path = require('path');

module.exports = [
    {
        command: ['tostatus'],
        desc: "Post content to WhatsApp status",
        operate: async ({ Tayc, m, reply, text }) => {
            const quoted = m.quoted || null;
            const mime = quoted?.mimetype || "";

            const generateTmpPath = (ext = 'bin') =>
                path.join(__dirname, `tmp-${Date.now()}.${ext}`);

            try {
                if (!text && !quoted) {
                    return reply(
                        "*Usage:*\n" +
                        "- Reply to an image, video, or audio to post it as status\n" +
                        "- Or send text to post it as a text status"
                    );
                }

                // === IMAGE ===
                if (/image/.test(mime)) {
                    const buffer = await quoted.download();
                    const filePath = generateTmpPath("jpg");
                    fs.writeFileSync(filePath, buffer);

                    const stats = fs.statSync(filePath);
                    const sizeMB = stats.size / (1024 * 1024);
                    if (sizeMB > 5) {
                        fs.unlinkSync(filePath);
                        return reply(`❌ Image too large (${sizeMB.toFixed(2)} MB). Max allowed is 5 MB.`);
                    }

                    await Tayc.sendMessage(
                        "status@broadcast",
                        { image: { url: filePath }, caption: text || "" }
                    );
                    fs.unlinkSync(filePath);
                    return reply("✅ Image posted to status.");
                }

                // === VIDEO ===
                if (/video/.test(mime)) {
                    const buffer = await quoted.download();
                    const filePath = generateTmpPath("mp4");
                    fs.writeFileSync(filePath, buffer);

                    const stats = fs.statSync(filePath);
                    const sizeMB = stats.size / (1024 * 1024);
                    if (sizeMB > 16) {
                        fs.unlinkSync(filePath);
                        return reply(`❌ Video too large (${sizeMB.toFixed(2)} MB). Max allowed is 16 MB.`);
                    }

                    await Tayc.sendMessage(
                        "status@broadcast",
                        { video: { url: filePath }, caption: text || "" }
                    );
                    fs.unlinkSync(filePath);
                    return reply("✅ Video posted to status.");
                }

                // === AUDIO ===
                if (/audio/.test(mime)) {
                    const buffer = await quoted.download();
                    const filePath = generateTmpPath("mp4");
                    fs.writeFileSync(filePath, buffer);

                    const stats = fs.statSync(filePath);
                    const sizeMB = stats.size / (1024 * 1024);
                    if (sizeMB > 16) {
                        fs.unlinkSync(filePath);
                        return reply(`❌ Audio too large (${sizeMB.toFixed(2)} MB). Max allowed is 16 MB.`);
                    }

                    await Tayc.sendMessage(
                        "status@broadcast",
                        {
                            audio: { url: filePath },
                            mimetype: "audio/mp4",
                            ptt: true
                        }
                    );
                    fs.unlinkSync(filePath);
                    return reply("✅ Audio posted to status.");
                }

                // === UNSUPPORTED ===
                if (quoted) {
                    return reply("⚠️ Unsupported media type. Please reply to an image, video, or audio.");
                }

                // === TEXT STATUS ===
                await Tayc.sendMessage("status@broadcast", { text });
                return reply("✅ Text status posted.");

            } catch (error) {
                console.error("Status post failed:", error);
                return reply("❌ Failed to post to status. Please try again later.");
            }
        }
    }
];
