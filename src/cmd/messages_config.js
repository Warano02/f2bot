const fs = require("fs")
const path = require("path");
module.exports = [
    {
        command: ["getaddmessage", "getaddmess", "gam"],
        desc: "Get a Add message",
        operate: async ({ reply, Settings, Tayc }) => {
            reply(`*YOUR ACTUAL ADD MESSAGE IS*:\n${Settings.mess.addNewContact || '*Hi 🖖. Save me as ' + Tayc.user.name + "*"}`)
        }
    },
    {
        command: ['setaddmessage', "setaddmsg", "setaddmess", "sam"],
        desc: "Set the bot add message",
        operate: async ({ reply, Settings, saveNewSetting, text }) => {
            if (!text) return reply("*❌Please provide the message to set as Add message*")
            Settings.mess.addNewContact = text
            saveNewSetting({ ...Settings })
            reply("*Add message modify successfully*")
        }
    },
    {
        command: ["setprompt", "setchatbotprompt", "scp"],
        desc: "Update chatbot system prompt for better response",
        operate: ({ reply, text, prefix }) => {
            try {
                if (!text || text.trim() === "") {
                    return reply("❌ *It looks like you forgot to provide the prompt text.*");
                }
                const filePath = path.resolve(__dirname, "../../prompt.txt");
                fs.writeFileSync(filePath, text.trim(), "utf-8");
                reply("✅ *Prompt system updated successfully.*");
            } catch (e) {
                console.error("Error updating prompt:", e);
                reply("❌ *An error occurred while updating the prompt. Please try again.*");
            }
        }
    }

]