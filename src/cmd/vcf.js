function generateBotInfoCard({
    name = "TAYC",
    username = "Warano Dev",
    platform = "Panel",
    prefix = "[ . ]",
    mode = "Private",
    version = "1.0.0",
    link = "https://sapjasha.com"
} = {}) {
    return `
*╔───────* *『*  *${name}*  *』* *═───────╗*
*»*  *Username:* *${username}*  
*»*  *Platform:* *${platform}*  
*»*  *Prefix:* *${prefix}*  
*»*  *Mode:* *${mode}*  
*»*  *Version:* *[ ${version} ]*  
*»*  ${link}  
*╚═══════════════════════╝*`.trim();
}
module.exports = [
    {
    command:["test"],
    desc:"test",
    operate:async ({reply}) => {
        reply(generateBotInfoCard())
    }
    },
  


] 