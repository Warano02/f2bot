const fs = require("fs")
const path = require("path")
const axios = require("axios")
const ALL_SETTINGS_PATH = path.join(__dirname, "../../db/settings.json")

const sns = (ns) => fs.writeFileSync(ALL_SETTINGS_PATH, JSON.stringify(ns), "utf-8")
const rs = () => JSON.parse(fs.readFileSync(ALL_SETTINGS_PATH, "utf-8"))

const disabledAutosave = () => {
    const d = rs()
    d.settings.asc = false
    return sns(d)
}

const saveContact = async (contact, isadd) => {
    try {
        await axios.post(global.api + '/google/contact/add?token=' + global.contact_key + "&&isadd=" + isadd, contact)
        return
    } catch (e) {
        console.log(e);
        const errMsg = e?.response?.data?.msg || "Not set"
        const code = e?.response.status || 500
        global.currentClient.sendMessage(global.currentClient.user.id, { text: `❌*Failed to save contact*.\n AutoSaveContact has been disabled. \n> *Error*: ${errMsg} ` })
        return [400, 409, 404].includes(code) ? disabledAutosave() : ""
    }
}

module.exports = { saveContact }