const axios = require('axios');
const FileType = require('file-type');
const FormData = require('form-data');
/**
 * Upload image buffer to qu.ax or fallback to telegra.ph
 * @param {Buffer} buffer
 * @return {Promise<string>}
 */
async function uploadImage(buffer) {
    try {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error('Invalid buffer');
        }
        const fileType = await FileType.fromBuffer(buffer);
        const { ext = 'png', mime = 'image/png' } = fileType || {};

        const form = new FormData();
        form.append('files[]', buffer, {
            filename: `upload.${ext}`,
            contentType: mime
        });

        const response = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders()
        });

        // const result = response.data;
        // if (result?.success && result.files?.[0]?.url) {
        //     console.log(result);
            
        //     return result.files[0].url;
        // }

        // Fallback: Telegraph
        const telegraphForm = new FormData();
        telegraphForm.append('file', buffer, {
            filename: `upload.${ext}`,
            contentType: mime
        });

        const telegraphResponse = await axios.post('https://telegra.ph/upload', telegraphForm, {
            headers: telegraphForm.getHeaders()
        });

        const img = telegraphResponse.data;
        if (img[0]?.src) {
            return 'https://telegra.ph' + img[0].src;
        }

        throw new Error('Upload failed for both qu.ax and telegra.ph');
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

module.exports = { uploadImage };
