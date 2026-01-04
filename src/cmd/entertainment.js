const axios = require("axios")

module.exports = [
    {
        command: ["ngl", "anonymous"],
        desc: "Send a Anonymous message to an user of NGL",
        /**
         * 
         * @param {import("../db/types").BotCommandContext} param0 
         */
        operate: async ({ Tayc, text, reply, react, cmd }) => {
            if (!text || text.split(";").length < 2) return reply(`❌*Provide the NGL link and message*\nExp: ${cmd} https://ngl.link/v15842 ; I love You`)
            const [link, h] = text.split(";")
            if (!link.startsWith("https://ngl.link/")) return reply("*Provide the valid ngl Link*")
            react("⌛")
            const response = await axios.get(`https://api.siputzx.my.id/api/tools/ngl?link=${link}&text=${h}`)
            reply("*I've send your message !*")
            react("")
        }

    }
]