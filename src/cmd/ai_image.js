module.exports = [
    {
        command: ['dalle'],
        desc: "Ask question to an AI",
        operate: async ({ Tayc, m, reply, text, react }) => {
            if (!text) return reply("*Please enter a query!*");
            await react("⌛")
            const apiUrl = `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(text)}`;
            try {
                await Tayc.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply("*An error occurred while generating the image.*");
            } finally {
                react("")
            }
        }
    },
    {
        command: ['imagine'],
        desc: "Generate image using the prompt of user!",
        operate: async ({ Tayc, m, reply, text, react }) => {
            if (!text) return reply("*Please provide the prompt*");
            await react("⌛")
            const apiUrl = `${global.siputzx}/api/ai/flux?prompt=${encodeURIComponent(text)}`;
            try {
                await Tayc.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply(global.mess.error);
            } finally {
                await react("")
            }
        }
    },
    {
        command: ['generate'],
        desc: "Generate Image using Seinsei Ai",
        operate: async ({ Tayc, m, reply, text, react }) => {
            if (!text) return reply("*Please provide the prompt*");

            const api3Url = `https://api.gurusensei.workers.dev/dream?prompt=${encodeURIComponent(text)}`;
            try {
                await react("⌛")
                await Tayc.sendMessage(m.chat, { image: { url: api3Url } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply(global.mess.error);
            } finally {
                react("")
            }
        }
    },
]