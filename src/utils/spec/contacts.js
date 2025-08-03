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

const saveContact = async (contact) => {
    try {
        await axios.post(global.api + '/google/contact/add?token=' + global.contact_key, contact)
        return
    } catch (e) {
        console.log(e);
        global.currentClient.sendMessage(global.currentClient.user.id, { text: `❌*Failed to save contact*.\n AutoSaveContact has been disabled. \n> *Error*: ${e?.response?.data?.msg}|| 'N/A'` })
        return disabledAutosave()
    }
}

module.exports = { saveContact }