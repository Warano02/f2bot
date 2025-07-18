async function statusDownloader({ Tayc, m, chatId }) {
    if (!m.quoted || m.quoted.chat !== 'status@broadcast') return

    try {
        const qMsg = m.quoted;
        const mime = qMsg.mimetype || '';
        if (mime.startsWith('image/') || mime.startsWith('video/') || mime.startsWith('audio/')) {
            const media = await qMsg.download();
            const mediaType = mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'audio';

            await Tayc.sendMessage(chatId, { [mediaType]: media, mimetype: mime, caption: qMsg?.caption || "", contextInfo: { isForwarded: true, forwardingScore: 999 } }, { quoted: m });

        } else if (qMsg.text || qMsg.message?.conversation) {
            const text = qMsg.text || qMsg.message?.conversation;
            await Tayc.sendMessage(chatId, { text, contextInfo: { isForwarded: true, forwardingScore: 999 } }, { quoted: m });
        }
    } catch (err) {
        console.error("❌ Status Downloader Error:", err);
    }
}

module.exports = statusDownloader;
