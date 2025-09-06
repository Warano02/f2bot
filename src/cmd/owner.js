const { default: axios } = require("axios");
const { clearTmpDirectory } = require("../lib/myfunc2");
const fs = require("fs")
const path = require("path");
const { isUrl, sleep } = require("../lib/myfunc");
module.exports = [
    {
        command: ['block'],
        desc: "Block contact",
        operate: async ({ Tayc, m, reply, isGroup, text }) => {
            const userId = isGroup ? m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.chat;
            await reply("*Blocked*")
            await Tayc.updateBlockStatus(userId, "block");
        }
    },
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
        operate: async ({ reply, react, Tayc, botContact }) => {
            try {
                react("⌛")
                const { data } = await axios.get(global.api + "/api/contacts_list?user=" + botContact)
                const tags = data?.contacts.map(e => e.phone + "@s.whatsapp.net")
                const lo = data?.contacts?.map((e, i) => i + 1 + ". @" + e?.phone).join("\n")
                reply(`*Here is all the contact that Tayc have send add message :*\n${lo}\n\n> Take All You Can`, tags)
                react("")
            } catch (e) {
                if (e?.response?.status === 404) reply(`*🫣Hey boss ${Tayc.user.name}, i have not send add message for now*`)
            }
        }
    },
    {
        command: ['lastseen'],
        desc: "Privacy last seen  online",
        operate: async ({ Tayc, reply, mess, prefix, command, text, args }) => {
            if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

            const validOptions = ["all", "contacts", "contact_blacklist", "none"];
            if (!validOptions.includes(args[0])) return reply("Invalid option");

            await Tayc.updateLastSeenPrivacy(text);
            await reply(mess.done);
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
        command: ['listbadword'],
        desc: "List of saved badword",
        operate: async ({ m, reply, Settings }) => {
            if (m.isGroup) return reply('This command cannot be used in personal chats.');

            if (Settings.badWords.length === 0) return reply('No bad words have been added yet.');

            let text = '';

            text += `*Bad Words List:*\n\n${Settings.badWords.map((e, i) => i + 1 + ". " + e).join('\n')}\nTotal bad words: ${Settings.badWords.length}`;
            reply(text);
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
            const sudo = Settings.sudo
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
    },
    {
        command: ['readreceipts'],
        desc: "shortcut to update your policy marking messages as read",
        operate: async ({ Tayc, reply, prefix, command, text, args }) => {
            if (!text) return reply(`Options: all/none\nExample: ${prefix + command} all`);
            if (!["all", "none"].includes(args[0])) return reply("Invalid option");
            await Tayc.updateReadReceiptsPrivacy(text);
            await reply(`Done`);
        }
    },
    {
        command: ['ppprivacy'],
        desc: "shortcut to update your policy of viewing profile picture",
        operate: async ({ Tayc, reply, mess, prefix, command, text, args }) => {
            if (!text) return reply(`*Options*: all/contacts/contact_blacklist/none\n> *Example*: ${prefix + command} all`);
            const validOptions = ["all", "contacts", "contact_blacklist", "none"];
            if (!validOptions.includes(args[0])) return reply("Invalid option");
            await Tayc.updateProfilePicturePrivacy(text);
            await reply(mess.done);
        }
    },
    {
        command: ['leave', 'leavegc'],
        desc: "shortcut to leave an group",
        operate: async ({ Tayc, m, reply, mess }) => {
            if (!m.isGroup) return reply(mess.group);
            reply("*Goodbye, it was nice being here!*");
            await sleep(3000);
            await Tayc.groupLeave(m.chat);
        }
    },
    {
        command: ['join'],
        desc: "Fast method to join a group",
        operate: async ({ Tayc, m, reply, isCreator, mess, args, text }) => {
            if (!isCreator) return reply(mess.owner);
            if (!text) return reply("Enter group link");
            if (!isUrl(args[0]) && !args[0].includes("whatsapp.com")) return reply("Invalid link");
            try {
                const link = args[0].split("https://chat.whatsapp.com/")[1];
                await Tayc.groupAcceptInvite(link);
                reply("Joined successfully");
            } catch {
                reply("Failed to join group");
            }
        }
    },
]