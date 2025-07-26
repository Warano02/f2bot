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
        operate: async ({ reply,Tayc }) => {
            const list = JSON.parse(fs.readFileSync(path.join(__dirname, "../db/contacts.json"), "utf-8"))
            if(!list.length)return reply(`*🫣Hey boss ${Tayc.user.name}, i have not send add message for now*`)
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


]