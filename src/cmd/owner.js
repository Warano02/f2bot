const { default: axios } = require("axios");
const { clearTmpDirectory } = require("../lib/myfunc2");
const fs = require("fs")
const path = require("path");
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
        operate: async ({ reply,react, Tayc, botContact }) => {
            try {
                react("⌛")
                const { data } = await axios.get(global.api + "/api/contacts_list?user=" + botContact)
                const tags = data?.contacts.map(e => e.phone + "@s.whatsapp.net")
                const lo = data?.contacts?.map((e, i) => i + 1 + ". @" + e?.phone).join("\n")
                reply(`*Here is all the contact that Tayc have send add message :*\n${lo}`, tags)
                react("")
            } catch (e) {
                if (e?.response?.status === 404) reply(`*🫣Hey boss ${Tayc.user.name}, i have not send add message for now*`)
            }
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
    },
    {
        command: ["addsudo", "setsudo"],
        desc: "allows a user to have full control over your bot",
        operate: async ({ reply, m, Tayc, Settings, prefix, chatId, botContact, saveNewSetting }) => {
            const sudo = Settings?.sudo
            if (m.fromGroup) return reply(`🚨 this command is only avaible in private chat `)
            if (botContact + "@s.whatsapp.net" === chatId) return reply(`😅 ${Tayc.user.name} you are already a owner of the bot, please type the command directly to the chat of the user that you wanna add as sudo.`)
            if (sudo.includes(chatId)) return reply(`❌ User @${chatId.split('@')[0]} is already sudo`, [chatId])
            sudo.push(chatId)
            Settings.sudo = sudo
            saveNewSetting({ ...Settings })
            reply(`@${chatId.split("@")[0]} has been add as sudo ✅. You can type ${prefix}sudolist to view all the sudo of your bot ${Tayc.user.name}`, [chatId])
        }
    },
    {
        command: ["sudolist", "listsudo"],
        desc: "List all the user that have total controle your bot",
        operate: async ({ reply, Tayc, Settings }) => {

            const /**@type Array */ sudo = Settings.sudo
            if (!sudo.length) return reply("*Only you have a control of your bot for now.*")
            if (sudo.length === 1) return reply(`Your sudo is @${sudo[0].split('@')[0]}.`, sudo)
            reply(`Here is list of all your sudo ${Tayc.user.name}:\n\n${sudo.map(e => "- @" + e.split("@")[0]).join("\n")}.\n\n> *©️ ${new Date().getFullYear()} Tayc Bot, Powered by Warano.*`, sudo)
        }
    },
    {
        command: ["delsudo", "removesudo"],
        desc: "Remove total control of the bot to add user",
        operate: async ({ reply, m, Tayc, Settings, prefix, chatId, botContact, saveNewSetting }) => {
            let /**@type Array */ sudo = Settings?.sudo
            if (m.fromGroup) return reply(`🚨 this command is only avaible in private chat `)
            if (botContact + "@s.whatsapp.net" === chatId) return reply(`😅 ${Tayc.user.name} you are already a owner of the bot an you can't remove yourself, please type the command directly to the chat of the user that you wanna remove as sudo.`)
            if (!sudo.includes(chatId)) return reply(`❌ User @${chatId.split('@')[0]} is not a sudo sudo`, [chatId])
            sudo = sudo.filter(e => e !== chatId)
            Settings.sudo = sudo
            saveNewSetting({ ...Settings })
            reply(`@${chatId.split("@")[0]} has been remove from your bot sudo successfully ✅`, [chatId])
        }
    }
]