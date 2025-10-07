const axios = require('axios');

const fetchReactionImage = async ({ Tayc, m, reply, command }) => {
    try {
        const { data } = await axios.get(`https://api.waifu.pics/sfw/${command}`);
        console.log(data);
        
        const res = await axios.get(data.url, { responseType: 'arraybuffer' })

        await Tayc.sendImageAsStickers(m.chat, Buffer.from(res.data), m, {
            packname: global.packname || "Tayc Bot",
            author: Tayc.user.name || "Warano",
        });

    } catch (error) {
        reply(global.mess.error);
    }
};

module.exports = [
    { command: ["bite"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "bite" }) },
    { command: ["blush"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "blush" }) },
    { command: ["bonk"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "bonk" }) },
    { command: ["bully"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "bully" }) },
    { command: ["cringe"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "cringe" }) },
    { command: ["cry"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "cry" }) },
    { command: ["cuddle"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "cuddle" }) },
    { command: ["dance"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "dance" }) },
    { command: ["feed"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "feed" }) },
    { command: ["glomp"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "glomp" }) },
    { command: ["goose"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "goose" }) },
    { command: ["handhold"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "handhold" }) },
    { command: ["happy"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "happy" }) },
    { command: ["highfive"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "highfive" }) },
    { command: ["hug"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "hug" }) },
    { command: ["kill"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "kill" }) },
    { command: ["kiss"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "kiss" }) },
    { command: ["lick"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "lick" }) },
    { command: ["nom"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "nom" }) },
    { command: ["pat"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "pat" }) },
    { command: ["poke"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "poke" }) },
    { command: ["slap"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "slap" }) },
    { command: ["smile"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "smile" }) },
    { command: ["smug"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "smug" }) },
    { command: ["tickle"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "tickle" }) },
    { command: ["wave"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "wave" }) },
    { command: ["wink"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "wink" }) },
    { command: ["woof"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "woof" }) },
    { command: ["yeet"], desc: "Simple trick to react message ", operate: async (cypherx) => fetchReactionImage({ ...cypherx, command: "yeet" }) },
];