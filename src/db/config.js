const fs = require("fs")
const path = require("path")

if (fs.existsSync(path.join(__dirname, "../../", ".env"))) require("dotenv").config()

global.siputzx = "https://api.siputzx.my.id";

global.contact_key = process.env.ASC || ""

global.wwe = "https://www.wwe.com/api/news";

global.wwe1 = "https://www.thesportsdb.com/api/v1/json/3/searchfilename.php?e=wwe";

global.wwe2 = "https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=wrestling";

global.falcon = "https://flowfalcon.dpdns.org";

global.mess = {
    error: "❌ *Error while executing the command*. Please try again!",
    done: `✅ mission accomplished successfully ${global.currentClient.user.name}`,
    group:"❌ *This command is avaible only in the group*"
}