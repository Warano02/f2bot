//@ts-check
const axios = require("axios");
module.exports = [
    {
        command: ["gpt"],
        desc: "Ask question to ChatGpt.",
        operate: async ({ text: query, reply, react }) => {

            if (!query) {
                react('❌')
                return reply(`❌ Please provide a question for ChatGPT.`)
            }
            react("🛜")
            try {
                const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);

                if (response.data && response.data.success && response.data.result) {
                    const answer = response.data.result.prompt;
                    reply(answer)
                    react("")
                } else {
                    throw new Error('Invalid response from API');
                }
            } catch (e) {
                console.error("Error in GPT command:", e);
                return reply("❌ An error occurred while processing your request.");
            }
        }
    },
    {
        command: ['gpt2'],
        desc: "Gpt 2",
        operate: async ({ m, reply, text }) => {
            if (!text) return reply("*Please provide question*");

            try {
                let response = await axios.get(`https://bk9.fun/ai/jeeves-chat?q=${encodeURIComponent(text)}`);
                let data = response.data();

                if (!data.BK9) {
                    reply(global.mess.error);
                } else {
                    reply(data.BK9);
                }
            } catch (error) {
                console.error('Error fetching response from GPT-2 API:', error);
                reply(global.mess.error);
            }
        }
    },
    {
        command: ['llama'],
        desc: "Ask question to llama ia",
        operate: async ({ m, reply, text }) => {
            if (!text) return reply("Please provide question");

            try {
                let response = await axios.get(`https://bk9.fun/ai/llama?q=${encodeURIComponent(text)}`);
                let data = response.data;

                if (!data.BK9) {
                    reply(global.mess.error);
                } else {
                    reply(data.BK9);
                }
            } catch (error) {
                console.error('Error fetching response from Llama API:', error);
                reply(global.mess.error);
            }
        }
    },
    {
        command: ["gemini"],
        desc: "Ask question to Gemini.",
        operate: async ({ text: query, reply, react }) => {

            if (!query) {
                react('❌')
                return reply(`❌ Please provide a question for ChatGPT.`)
            }
            
            const apis = [
                `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
            ];

            react("🛜")
            try {
                for (const api of apis) {
                    try {
                        const response = await axios.get(api);
                        const data = response.data;

                        if (data.message || data.data || data.answer || data.result) {
                            const answer = data.message || data.data || data.answer || data.result;
                            reply(answer);
                            return;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                throw new Error('All Gemini APIs failed');
            } catch (e) {
                console.error("Error in GPT command:", e);
                return reply("❌ An error occurred while processing your request.");
            }

        }
    }
]