const statusDownloader = require("../utils/common/status")
const viewOnceUtils = require("../utils/common/viewonce")
module.exports = [
    {
        command: ["repeat", "rpt"],
        desc: "Multiply the message",
        operate: async ({ Tayc, reply, text, mess, cmd }) => {
            try {
                const [msg, count] = text.split("$$")
                if (!msg || !count) return reply(`❌ *Invalid usage*\n\nUsage: ${cmd} <message>$$<count>`)
                if (isNaN(count) || count <= 0) return reply(`❌ *Invalid count*\n\nCount must be a positive number.`)
                const response = msg.concat("_)))_").repeat(Number(count)).replace(/_\)\)\)_/g, '\n')
                reply(response)
            } catch {
                reply(mess.error)
            }
        }
    },
    {
        command: ["vv", "rvv", "removewiewonce"],
        desc: "Remove view once message",
        operate: async ({ Tayc, m: message, quoted, react, chatId }) => {
            if (!quoted) return react("❌")
            return viewOnceUtils({ Tayc, message, chatId })
        }
    },
    {
        command: ["vv2", "rvv2"],
        desc: "Remove view once message and send it privately",
        operate: async ({ Tayc, m: message, quoted, react, botNumber }) => {
            if (!quoted) return react("❌")
            return viewOnceUtils({ Tayc, message, chatId: botNumber })
        }
    },
    {
        command: ["save"],
        desc: "Download status when reply to it",
        operate: async ({ Tayc, m, chatId, reply, cmd }) => {
            if (!m.quoted || m.quoted.chat !== 'status@broadcast') return reply(`*❌Invalid usage*. Reply to an status using ${cmd}`)
            await statusDownloader({ Tayc, m, chatId })
        }
    },
  


]