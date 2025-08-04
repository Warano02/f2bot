const statusDownloader = require("../common/status")
const viewOnceUtils = require("../common/viewonce")

async function handleQuotedMessage({ Tayc, m, botNumber }) {
    if (!m.quoted || !m.fromMe) return
    if (m.quoted.viewOnce) {
        const i1 = `*viewOnce send by @${m.quoted.sender.split("@")[0]} `
        return viewOnceUtils({ Tayc, message: m, chatId: botNumber, e00e: i1, e01e: [m.quoted.sender] })
    }

    if (m.quoted.chat === 'status@broadcast') {
        return statusDownloader({ Tayc, m, chatId: botNumber })
    }
    return true
}
module.exports = handleQuotedMessage