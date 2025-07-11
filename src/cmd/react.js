const axios = require('axios');

const fetchReactionImage = async ({ Cypher, m, reply, command }) => {
    try {
        const { data } = await axios.get(`https://api.waifu.pics/sfw/${command}`);
        await Cypher.sendImageAsSticker(m.chat, data.url, m, {
            packname: global.packname,
            author: global.author,
        });
    } catch (error) {
        reply(global.mess.error);
    }
};
const tab = [
    { command: ["bite"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "bite" }) },
    { command: ["blush"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "blush" }) },
    { command: ["bonk"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "bonk" }) },
    { command: ["bully"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "bully" }) },
    { command: ["cringe"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "cringe" }) },
    { command: ["cry"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "cry" }) },
    { command: ["cuddle"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "cuddle" }) },
    { command: ["dance"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "dance" }) },
    { command: ["feed"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "feed" }) },
    { command: ["glomp"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "glomp" }) },
    { command: ["goose"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "goose" }) },
    { command: ["handhold"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "handhold" }) },
    { command: ["happy"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "happy" }) },
    { command: ["highfive"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "highfive" }) },
    { command: ["hug"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "hug" }) },
    { command: ["kill"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "kill" }) },
    { command: ["kiss"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "kiss" }) },
    { command: ["lick"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "lick" }) },
    { command: ["nom"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "nom" }) },
    { command: ["pat"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "pat" }) },
    { command: ["poke"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "poke" }) },
    { command: ["slap"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "slap" }) },
    { command: ["smile"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "smile" }) },
    { command: ["smug"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "smug" }) },
    { command: ["tickle"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "tickle" }) },
    { command: ["wave"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "wave" }) },
    { command: ["wink"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "wink" }) },
    { command: ["woof"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "woof" }) },
    { command: ["yeet"], operate: async (Tayc) => fetchReactionImage({ ...Tayc, command: "yeet" }) },
]

module.exports =tab.map((el)=>{return {...el,desc:"React messages as with sticker !"}}) ;