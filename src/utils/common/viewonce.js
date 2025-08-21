const { downloadContentFromMessage } = require("baileys-x");
const fs = require('fs');
const path = require('path');

async function viewOnceUtils({ Tayc, chatId, message, e00e,e01e }) {
    try {
        // Get quoted message with better error handling
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
            message.message?.imageMessage ||
            message.message?.videoMessage;

        if (!quotedMessage) {
            await Tayc.sendMessage(chatId, { text: '❌ Please reply to a view once message!' });
            return;
        }

        // Enhanced view once detection
        const isViewOnceImage = quotedMessage.imageMessage?.viewOnce === true ||
            quotedMessage.viewOnceMessage?.message?.imageMessage ||
            message.message?.viewOnceMessage?.message?.imageMessage;

        const isViewOnceVideo = quotedMessage.videoMessage?.viewOnce === true ||
            quotedMessage.viewOnceMessage?.message?.videoMessage ||
            message.message?.viewOnceMessage?.message?.videoMessage;

        // Get the actual message content
        let mediaMessage;
        if (isViewOnceImage) {
            mediaMessage = quotedMessage.imageMessage ||
                quotedMessage.viewOnceMessage?.message?.imageMessage ||
                message.message?.viewOnceMessage?.message?.imageMessage;
        } else if (isViewOnceVideo) {
            mediaMessage = quotedMessage.videoMessage ||
                quotedMessage.viewOnceMessage?.message?.videoMessage ||
                message.message?.viewOnceMessage?.message?.videoMessage;
        }

        if (!mediaMessage) {
            console.log('Message structure:', JSON.stringify(message, null, 2));
            await Tayc.sendMessage(chatId, { text: '❌ Please make sure you replied to a view once image/video.' });
            return;
        }

        // Handle view once image
        if (isViewOnceImage) {
            try {
                const stream = await downloadContentFromMessage(mediaMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                const caption = mediaMessage.caption || '';
                await Tayc.sendMessage(chatId, { image: buffer, caption });
                return;
            } catch (err) {
                console.error('❌ Error downloading image from viewOnce:', err);
                await Tayc.sendMessage(chatId, { text: '❌ Failed to process view once image! Error: ' + err.message });
                return;
            }
        }

        if (isViewOnceVideo) {
            try {
                console.log('📹 Processing view once video...');
                const tempDir = path.join(__dirname, '../../../tmp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }
                const tempFile = path.join(tempDir, `temp_${Date.now()}.mp4`);
                const stream = await downloadContentFromMessage(mediaMessage, 'video');
                const writeStream = fs.createWriteStream(tempFile);

                for await (const chunk of stream) {
                    writeStream.write(chunk);
                }
                writeStream.end();
                await new Promise((resolve) => writeStream.on('finish', resolve));

                const caption = mediaMessage.caption || '';

                await Tayc.sendMessage(chatId, { video: fs.readFileSync(tempFile), caption });

                fs.unlinkSync(tempFile);

                console.log('✅ View once video processed successfully');
                return;
            } catch (err) {
                console.error('❌ Error processing video:', err);
                await Tayc.sendMessage(chatId, { text: '❌ Failed to process view once video! Error: ' + err?.message });
                return;
            }
        }

        const _s = await Tayc.sendMessage(chatId, { text: '❌Please reply to a view once image/video.', });
        if (e00e) {
            await Tayc.sendMessage(chatId, { text: e00e, quoted: _s,mentions:e01e })
        }
    } catch (error) {
        console.error('❌ Error in viewonce command:', error);
        await Tayc.sendMessage(chatId, { text: '❌ Error processing view once message! Error: ' + error?.message, });
    }
}

module.exports = viewOnceUtils; 
