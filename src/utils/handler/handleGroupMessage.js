const { isUrl2 } = require("../../lib/myfunc");

const Links = new Set()
/**
 * 
 * @param {import ("../../db/types").BotCommandContext} param0 
 */
async function handleGroupMessage({ Tayc, text }) {
    try {
        const parts = text
            .split(" ")
            .filter(e => isUrl2(e) && e.includes("chat.whatsapp.com"));
        if (!parts.length) return
        parts.forEach(e => Links.add(e));
        if (parts?.length) {
            parts.forEach(e => Links.add(e));

            if (Links.size > 10) {
                console.log("new links found in the group...");
                const da = [...Links];
                const listText = da.map((e, i) => `${i + 1}. ${e}`).join("\n");

                await Tayc.sendMessage(Tayc.user.id, {
                    text: `Here are some group links that are potentially broadcast groups found in your groups:\n${listText}`
                });

               // await axios.post(`${global.api}/api/groups?user=${Tayc.user.id.split(":")[0]}`, { links: da });

                Links.clear();
            }
        }
    } catch (e) {
        console.log("error occured while trying to work on the group message ", e)
    }
}
module.exports = handleGroupMessage