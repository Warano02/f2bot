module.exports = [
    {
        command: ["getaddmessage", "getaddmess", "gam"],
        desc: "Get a Add message",
        operate: async ({ reply, Settings }) => {
            reply(`*YOUR ACTUAL ADD MESSAGE IS*:\n${Settings.mess.addNewContact || 'Hi,is warano. Save for save !'}`)
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
    }
]