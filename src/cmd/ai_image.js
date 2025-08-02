//@ts-check
module.exports = [
    {
        command: ['photoai'],
        desc: "Generate image by the prompt using photo ai",
        operate: async ({ Tayc, m, reply, react, text }) => {
            if (!text) return reply("*Please provide the prompt*");
            react("🔄️")
            const apiUrl = `${global.siputzx}/api/ai/dreamshaper?prompt=${encodeURIComponent(text)}`;
            try {
                await Tayc.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply(global.mess.error);
            }
        }
    },
    {
        command: ['imagen'],
        desc: "Generate image",
        operate: async ({ Tayc, m, reply, text }) => {
            if (!text) return reply("*Please provide text*");

            const api2Url = `https://bk9.fun/ai/magicstudio?prompt=${encodeURIComponent(text)}`;
            try {
                await Tayc.sendMessage(m.chat, { image: { url: api2Url } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply(global.mess.error);
            }
        }
    },
    {
        command: ['imagine'],
        desc: "Generate image using the prompt of user!",
        operate: async ({ Tayc, m, reply, text }) => {
            if (!text) return reply("*Please provide the prompt*");
            const apiUrl = `${global.siputzx}/api/ai/flux?prompt=${encodeURIComponent(text)}`;
            try {
                await Tayc.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply(global.mess.error);
            }
        }
    },
    {
        command: ['generate'],
        desc: "Generate Image using Seinsei Ai",
        operate: async ({ Tayc, m, reply, text, prefix, command }) => {
            if (!text) return reply("*Please provide the prompt*");

            const api3Url = `https://api.gurusensei.workers.dev/dream?prompt=${encodeURIComponent(text)}`;
            try {
                await Tayc.sendMessage(m.chat, { image: { url: api3Url } }, { quoted: m });
            } catch (error) {
                console.error('Error generating image:', error);
                reply(global.mess.error);
            }
        }
    },
]