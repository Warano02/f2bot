const { default: axios } = require("axios");
const { clearTmpDirectory } = require("../../lib/myfunc2");
const fs = require("fs")
const path = require("path")
module.exports = [
    {
        command: ["cleartmp", "cleantmp", "clstmp"],
        desc: 'Clear temporary files',
        operate: async ({ reply, isOwner }) => {
            if (!isOwner) return reply('❌ You are not allowed to use this command!');
            const result = await clearTmpDirectory();
            reply(result.message);
        }
    },
    {
        command: ["contactlist", "ctl"],
        desc: "Show all the contact that bot have send add message",
        operate: async ({ reply, Tayc }) => {
            const list = JSON.parse(fs.readFileSync(path.join(__dirname, "../db/contacts.json"), "utf-8"))
            if (!list.length) return reply(`*🫣Hey boss ${Tayc.user.name}, i have not send add message for now*`)
            reply(`*Here is all the contact that Tayc have send add message :*\n${list.map((e, i) => i + 1 + ". @" + e.split("@")[0]).join("\n")}`, list)
        }
    },
    {
        command: ["clearcontact", "clsc"],
        desc: "Reset the contact list used for adding",
        operate: async ({ reply }) => {
            const filePath = path.join(__dirname, "../db/contacts.json");

            try {
                fs.writeFileSync(filePath, JSON.stringify([]));
                reply("✅ *Your contact list has been successfully cleared.*");
            } catch (error) {
                console.error("Failed to clear contacts:", error);
                reply("❌ *An error occurred while clearing your contact list. Please try again later.*");
            }
        }
    },
    {
        command: ["lang", "setlang"],
        desc: "Set the language of the bot",
        operate: async ({ reply, args, Settings, settings, saveNewSetting }) => {
            try {
                if (!["en", "fr"].includes(args[0])) return reply(`❌ Invalid argument. Please use "en" or "fr".`)
                settings.lang = args[0]
                saveNewSetting({ ...Settings, settings })
                reply(`*✅ Language set to ${args[0]} successfully !*`);
            } catch { }
        }
    },
    {
        command: ["premium", "setpremium"],
        desc: "Set the premium status of the bot",
        operate: async ({ reply, botNumber, text, cmd }) => {
            if (!text) return reply(`❌ *Please provide infos of who you wanna promote to premium user.*\n*Example:*\n${cmd} 23769200880066 $ Jessica\n\n> You can use the phone number and the name of the user.`);
            const [phone, name] = text.split("$").map(e => e.trim());
            if (!phone || !name) return reply(`❌ *Please provide infos of who you wanna promote to premium user.*\n*Example:*\n${cmd} <number> $ <name>.`);
            try {
                const { data } = await axios.post(global.api + "/config/set_premium", { name, phone }, { headers: { id: botNumber.split("@")[0].split(":")[0] } })
                if (data?.error) throw new Error(data);
                reply(data?.msg, [phone.trim() + "@s.whatsapp.net"]);
            } catch (e) {
                reply(`❌ *Error occurred while trying to set premium user.* Details:\n- *Status*: ${e?.response?.status || 500}\n- *Message*: ${e?.response?.data?.msg || e?.message}.\n\n> *If you think this is a mistake, please contact the bot owner via @237692883017.*`, ["237692883017@s.whatsapp.net"]);
            }
        }
    }


]