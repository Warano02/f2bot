const axios = require("axios");

module.exports=[
     {
  command: ['tinyurl', 'shortlink'],
  desc:"A fast link shortener for more professional links",
  operate: async ({ m, text,cmd, reply }) => {
    if (!text) return reply(`*Example: ${cmd} https://instagram.com/your_name*`);
    
    try {
      const response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
      reply(response.data);
    } catch (error) {
      console.error(error);
      reply('*An error occurred while shortening the URL.*');
    }
  }
},
]