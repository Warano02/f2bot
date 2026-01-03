const axios = require("axios");
const { sleep } = require("../lib/myfunc");

module.exports = [
    {
        command: ["tiktok", "tkt"],
        desc: "Download a TikTok video",
        operate: async ({ reply, Tayc, m, react, text, cmd }) => {
            if (!text) return reply(`*Provide a valid TikTok link.*\n\n*Example:*\n> ${cmd} https://vm.tiktok.com/xxx`);

            if (global.tktd) return react("🚨");

            global.tktd = true;
            let attempts = 0;
            const maxAttempts = 3;

            react("⏳");
            while (attempts < maxAttempts) {
                try {
                    const { data } = await axios.get(`https://api.sparky.biz.id/api/downloader/tiktok?url=${encodeURIComponent(text)}`);

                    if (data?.data?.video) {
                        await Tayc.sendMessage(m.chat, {
                            video: { url: data.data.video },
                            caption: data.data.title || "🎵 TikTok Video",
                            mimetype: "video/mp4",
                            fileName: "video.mp4"
                        }, { quoted: m });

                        react("✅");
                        break;
                    } else {
                        throw new Error("No video found in response");
                    }

                } catch (err) {
                    console.log(`❌ Attempt ${attempts + 1} failed:`, err.message || err);
                    await sleep(3000)
                    attempts++;
                }
            }

            if (attempts === maxAttempts) {
                react("❌");
                reply("❌ *Failed to download the TikTok video. Please try again later.*");
            }

            global.tktd = false;
        }
    },
    {
        command: ["tiktokaudio", "tkta"],
        desc: "Download a TikTok video as an audio",
        operate: async ({ reply, Tayc, m, react, text, cmd }) => {
            if (!text) return reply(`*Provide a valid TikTok link.*\n\n*Example:*\n> ${cmd} https://vm.tiktok.com/xxx`);

            if (global.tktd) return react("🚨");

            global.tktd = true;
            let attempts = 0;
            const maxAttempts = 3;

            react("⏳");
            while (attempts < maxAttempts) {
                try {
                    const { data } = await axios.get(`https://api-aswin-sparky.biz.id/api/downloader/tiktok?url=${encodeURIComponent(text)}`);

                    if (data?.data?.video) {
                        await Tayc.sendMessage(m.chat, {
                            video: { url: data.data.video },
                            caption: data.data.title || "🎵 TikTok Video",
                            mimetype: "video/mp4",
                            fileName: "video.mp4"
                        }, { quoted: m });

                        react("✅");
                        break;
                    } else {
                        throw new Error("No video found in response");
                    }

                } catch (err) {
                    console.log(`❌ Attempt ${attempts + 1} failed:`, err.message || err);
                    await sleep(3000)
                    attempts++;
                }
            }

            if (attempts === maxAttempts) {
                react("❌");
                reply("❌ *Failed to download the TikTok video. Please try again later.*");
            }

            global.tktd = false;
        }
    },
    {
        command: ['facebook', 'fbdl'],
        desc: "Download Facebook video",
        operate: async ({ m, text, Tayc, reply, react }) => {
            if (!text) return reply(`*Please provide a Facebook video url!*`);

            try {
                react("⏳");
                var dlink = await axios.get(`https://api.sparky.biz.id/api/downloader/fbdl?url=${text}`);

                var dlurl = dlink.data.data.high                
                await Tayc.sendMessage(m.chat, {
                    video: { url: dlurl, }
                }, {
                    quoted: m
                });
            } catch (error) {
                reply('*❌ Please try again later*');
            }
        }
    },
    {
        command: ['gdrive'],
        desc: "Download files from a google drive",
        operate: async ({ Tayc, m, reply, text }) => {
            if (!text) return reply("*Please provide a Google Drive file URL*");

            try {
                let response = await fetch(`${global.siputzx}/api/d/gdrive?url=${encodeURIComponent(text)}`);
                let data = await response.json();

                if (response.status !== 200 || !data.status || !data.data) {
                    return reply("*Please try again later or try another command!*");
                } else {
                    const downloadUrl = data.data.download;
                    const filePath = path.join(__dirname, `${data.data.name}`);

                    const writer = fs.createWriteStream(filePath);
                    const fileResponse = await axios({
                        url: downloadUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    fileResponse.data.pipe(writer);

                    writer.on('finish', async () => {
                        await Tayc.sendMessage(m.chat, {
                            document: { url: filePath },
                            fileName: data.data.name,
                            mimetype: fileResponse.headers['content-type']
                        });

                        fs.unlinkSync(filePath);
                    });

                    writer.on('error', (err) => {
                        console.error('Error downloading the file:', err);
                        reply("An error occurred while downloading the file.");
                    });
                }
            } catch (error) {
                console.error('Error fetching Google Drive file details:', error);
                reply("*Please try again!*");
            }
        }
    },
    {
        command: ['gitclone'],
        desc: "Download files from a GitHub repository",
        operate: async ({ m, args, prefix, command, Tayc, reply, mess, }) => {
            if (!args[0])
                return reply(`*GitHub link to clone?*\nExample :\n${prefix}${command} https://github.com/warano02/Tayc`);
            const regex1 = /(?:https|git)(?::\/\/|@)(www\.)?github\.com[\/:]([^\/:]+)\/(.+)/i;
            const [, , user, repo] = args[0].match(regex1) || [];

            if (!repo) {
                return reply("*Invalid GitHub link format. Please double-check the provided link.*");
            }

            const repoName = repo.replace(/.git$/, "");
            const url = `https://api.github.com/repos/${user}/${repoName}/zipball`;

            try {
                const response = await fetch(url, { method: "HEAD" });
                const filename = response.headers
                    .get("content-disposition")
                    .match(/attachment; filename=(.*)/)[1];

                await Tayc.sendMessage(
                    m.chat,
                    {
                        document: { url: url },
                        fileName: filename + ".zip",
                        mimetype: "application/zip",
                    },
                    { quoted: m }
                );
            } catch (err) {
                console.error(err);
                reply(mess.error);
            }
        }
    },
    {
        command: ['image', 'img'],
        desc: "Download image",
        operate: async ({ Tayc, m, reply, text }) => {
            if (!text) return reply("*❗ Please provide a search query.*");

            try {
                const response = await fetch(`${global.siputzx}/api/s/pinterest?query=${encodeURIComponent(text)}`);
                const data = await response.json();

                if (
                    response.status !== 200 ||
                    !data.status ||
                    !Array.isArray(data.data) ||
                    data.data.length === 0
                ) {
                    return reply("*❌ No image found. Try a different keyword or try again later.*");
                }

                const images = data.data
                    .slice(0, 5);

                for (const image of images) {
                    console.log(image);

                    try {
                        const imgRes = await axios.get(image?.image_url, { responseType: 'arraybuffer' });
                        const buffer = Buffer.from(imgRes.data);

                        await Tayc.sendMessage(m.chat, {
                            image: buffer,
                        });
                    } catch (imgErr) {
                        console.warn(`❌ Failed to download image: ${image?.images_url}`);
                    }
                }

            } catch (error) {
                console.error('General error fetching images:', error);
                reply("*❌ An error occurred while fetching images. Please try again later.*");
            }
        }
    },
    {
        command: ['itunes'],
        desc: "Get information about a song from iTunes",
        operate: async ({ m, text, Tayc, reply }) => {
            if (!text) return reply("*❗ Please provide the name of a song.*");

            try {
                const res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`);
                if (!res.ok) {
                    throw new Error(`API responded with status ${res.status}`);
                }

                const json = await res.json();

                if (!json.name || !json.artist) {
                    return reply("*❌ Song not found. Please try a different title.*");
                }

                const songInfo = `*🎵 Song Information:*\n\n` +
                    `• *Name:* ${json.name}\n\n` +
                    `• *Artist:* ${json.artist}\n\n` +
                    `• *Album:* ${json.album}\n\n` +
                    `• *Release Date:* ${json.release_date}\n\n` +
                    `• *Price:* ${json.price}\n\n` +
                    `• *Length:* ${json.length}\n\n` +
                    `• *Genre:* ${json.genre}\n\n` +
                    `• *Preview:* ${json.url}`;

                if (json.thumbnail) {
                    await Tayc.sendMessage(
                        m.chat,
                        {
                            image: { url: json.thumbnail },
                            caption: songInfo
                        },
                        { quoted: m }
                    );
                } else {
                    reply(songInfo);
                }

            } catch (error) {
                console.error("Error fetching iTunes data:", error);
                reply("*❌ An error occurred while fetching the song info. Please try again later.*");
            }
        }
    }
]