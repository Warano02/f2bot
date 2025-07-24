const { performance } = require('perf_hooks')
const moment = require('moment-timezone')
const os = require('os')
const { getCommands } = require('../lib/loader')
const axios = require("axios")

module.exports = [
    {
        command: ["menu"],
        desc: "Show all the command useful for Tayc bot",
        operate: async ({ Tayc, reply, allCommands, settings }) => {
            try {
                reply("Menu loading...");

                const CMDS = getCommands();
                const start = performance.now();
                const version = require("../../package.json").version;
                const host = 'Panel';

                moment.locale('fr');
                const date = moment().tz('Africa/Douala').format('dddd D MMMM YYYY');
                const time = moment().tz('Africa/Douala').format('HH:mm:ss');
                const botName = global.botName || "Tayc";
                const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0); // GB
                const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1); // MB
                const end = performance.now();
                const speed = (end - start).toFixed(2);

                let text = `
┌──────◇ ${botName} ◇┐
│ *OWNER*   : ${Tayc?.user?.name || "Unknown"}
│ *PREFIX*  : [ ${settings.prefix} ]
│ *DATE*    : ${date}
│ *TIME*    : ${time}
│ *HOST*    : ${host}
│ *MODE*    : ${settings.mode}
│ *VERSION* : ${version}
│ *SPEED*   : ${speed} ms
│ *PLUGINS* : ${CMDS.length}
│ *USAGE*   : ${usedMem} MB of ${totalMem} GB
└────────────────────────
            `.trim();

                text += `\n\n`;

                for (const [category, commands] of Object.entries(allCommands)) {
                    const sorted = [...commands].sort((a, b) => a.command[0].localeCompare(b.command[0]));
                    text += `╭───❍ *${category.toUpperCase()} COMMANDS*\n`;
                    for (const cmd of sorted) {
                        text += `│ • ${cmd.command[0].toUpperCase()} \n`;
                    }
                    text += `╰──────────────\n\n`;
                }

                text += `> © ${new Date().getFullYear()} Tayc Bot BY *Warano*. All rights reserved.`;

                await reply(text);
            } catch (err) {
                console.error("❌ Failed to build menu:", err);
                reply("❌ Une erreur est survenue lors de la génération du menu.");
            }
        }
    },
    {
        command: ["help"],
        desc: 'Show an command help',
        operate: async ({ allCommands, reply, prefix, text }) => {
            const CMDS = getCommands();
            let helpText = `┌───[ *Commands help center* ]───┐\n`

            for (const [category, commands] of Object.entries(allCommands)) {
                for (const cmd of commands) {
                    helpText += `│ *${prefix}${cmd.command[0]}* → ${cmd.length < 20 ? cmd.desc : cmd?.desc.slice(0, 17) + "..."}\n`
                }
            }
            helpText += `\n\n> *NB*: You can type ${prefix}help *<Command>* to get spécifique command help\n`

            helpText += `╰─────[ *TAKE ALL YOU CAN* ]──────\n\n`

            if (!text) return reply(helpText)
            const matched = CMDS.find(cmd =>
                Array.isArray(cmd.command) ? cmd.command.includes(text) : cmd.command === text
            );
            if (!matched) return reply(`❌*${text}* command non found!. Contact Warano here @237621092130 to apply for implementation of it`, ["237621092130@s.whatsapp.net"])
            reply(`ℹ️ Here is *${text}* usage details:\n- *COMMAND*: ${text}\n- *Equivalent(s)*:\n${matched.command.map(e => "> " + e).join("\n")}\n- *Description*: ${matched?.desc || "No description for this command"}`)
        }
    },
    {
        command: ["tayc"],
        desc: "Help user to use the bot command",
        operate: async ({ reply,botNumber, text ,react,prefix}) => {
            if(!text)return reply("🫣What you wanna know?\n*Please provide me the question.*")
            const commands = getCommands()
            const commandList = commands.map((command) => {
                const __source = command?.__source.split("\\")
                const category = __source[__source.length - 1].split(".")[0].toUpperCase()
                return { category, command: command.command.map(e=>prefix+e), desc: command.desc }
            })
           // console.log(commandList);
            let i = 0

            react("🧠")
            while (i < 4) {
                try {
                    const { data } = await axios.post(`${global.api}/api/tayc`, { q: text, c: commandList,p:botNumber.split("@")[0].replace(":",'') })
                    if (data?.error) throw new Error(data?.msg);
                    react("")
                    return reply(data?.msg)
                } catch (e) {
                     i++
                     console.log(i);
                     
                    console.log(e);
                }
            }
            react("❌")
            reply("❌*Please try again*")
        }

    }

]