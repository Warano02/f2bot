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
        command: ['blackbox'],
        desc: "Ask question to an AI",
        operate: async ({ m, reply, text, react }) => {
            if (!text) return reply("*Please ask a question*");

            try {
                react("⌛")
                let response = await fetch(`https://api.siputzx.my.id/api/ai/blackboxai?content=${encodeURIComponent(text)}`);
                let data = await response.json();

                if (response.status !== 200 || !data.status || !data.data) {
                    return reply("*Please try again later or try another command!*");
                } else {
                    reply(data.data);
                }
            } catch (error) {
                console.error('Error fetching response from BlackboxAI API:', error);
                reply("An error occurred while fetching the response from BlackboxAI API.");
            }
        }
    },
    {
        command: ['dbrx'],
        desc: "Ask question to an AI",
        operate: async ({ m, reply, text }) => {
            if (!text) return reply("*Please ask a question*");

            try {
                const apiUrl = `https://api.siputzx.my.id/api/ai/dbrx-instruct?content=${encodeURIComponent(text)}`;
                const response = await fetch(apiUrl);
                const result = await response.json();

                if (!result.status || !result.data) {
                    return reply("*Please try again later or try another command!*");
                } else {
                    reply(result.data);
                }
            } catch (error) {
                console.error('Error fetching response from DBRX API:', error);
                reply("An error occurred while fetching the response from DBRX API.");
            }
        }
    },
    {
        command: ['deepseek'],
        desc: "Ask question to Deepseek ai",
        operate: async ({ m, reply, text, react }) => {
            if (!text) return reply("*Please ask a question*");

            try {
                await react("⌛")
                const apiUrl = `https://api.siputzx.my.id/api/ai/deepseek-r1?content=${encodeURIComponent(text)}`;
                const response = await fetch(apiUrl);
                const result = await response.json();

                if (!result.status || !result.data) {
                    return reply("*Please try again later or try another command!*");
                } else {
                    reply(result.data);
                }
            } catch (error) {
                console.error('Error fetching response from DeepSeek-R1 API:', error);
                reply("An error occurred while fetching the response from DeepSeek-R1 API.");
            } finally {
                react("")
            }
        }
    },
    {
        command: ['doppleai'],
        desc: "Ask question to an AI",
        operate: async ({ reply, m, text, react }) => {
            async function fetchDoppleAIResponse(query) {
                const response = await axios.get(`https://xploader-api.vercel.app/doppleai?prompt=${encodeURIComponent(query)}`);
                return response.data;
            }

            try {
                if (!text) return reply('*Please ask a question*');
                react("⌛")
                const result = await fetchDoppleAIResponse(text);
                reply(result.response);
            } catch (error) {
                console.error('Error in DoppleAI plugin:', error);
                reply('An error occurred!');
            } finally {
                react("")
            }
        }
    },
    {
        command: ['letterai'],
        desc: "Ask question to an AI specialise to the letter writting",
        operate: async ({ m, reply, text }) => {
            if (!text) return reply("*Please provide an input for the letter.*");

            try {
                const apiUrl = `https://api.siputzx.my.id/api/ai/moshiai?input=${encodeURIComponent(text)}`;
                const response = await fetch(apiUrl);
                const result = await response.json();

                if (!result.status || !result.data) {
                    return reply("*Please try again later or try another command!*");
                } else {
                    reply(result.data);
                }
            } catch (error) {
                console.error('Error fetching response from LetterAI API:', error);
                reply("An error occurred while fetching the response from LetterAI API.");
            }
        }
    },
    {
        command: ['mistral'],
        desc: "Ask question to mistral Ai",
        operate: async ({ m, reply, text }) => {
            if (!text) return reply("*Please ask a question*");

            try {
                const apiUrl = `https://api.siputzx.my.id/api/ai/mistral-7b-instruct-v0.2?content=${encodeURIComponent(text)}`;
                const response = await fetch(apiUrl);
                const result = await response.json();

                if (!result.status || !result.data) {
                    return reply("*Please try again later or try another command!*");
                } else {
                    reply(result.data);
                }
            } catch (error) {
                console.error('Error fetching response from Mistral API:', error);
                reply("An error occurred while fetching the response from Mistral API.");
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