const axios = require('axios');
module.exports = [
  {
    command: ['bible'],
    desc: "Give a bible verset",
    operate: async ({ m, text, prefix, command, reply }) => {
      const BASE_URL = "https://bible-api.com";

      try {
        let chapterInput = text.split(" ").join("").trim();
        if (!chapterInput) {
          throw new Error(`*Please specify the chapter number or name. Example: ${prefix + command} John 3:16*`);
        }
        chapterInput = encodeURIComponent(chapterInput);
        let chapterRes = await axios.get(`${BASE_URL}/${chapterInput}`);
        let chapterData = chapterRes.data;
        let bibleChapter = `
*The Holy Bible*\n
*Chapter ${chapterData.reference}*\n
Type: ${chapterData.translation_name}\n
Number of verses: ${chapterData.verses.length}\n
*Chapter Content:*\n
${chapterData.text}\n`;

        reply(bibleChapter);
      } catch (error) {
        reply(`Error: ${error.message}`);
      }
    }
  },
  {
    command: ['quran'],
    desc: "🕋",
    operate: async ({ m, text, Tayc, reply }) => {
      try {
        let surahInput = text.split(" ")[0];
        if (!surahInput) {
          throw new Error(`*Please specify the surah number or name*`);
        }

        let surahListRes = await axios.get("https://quran-endpoint.vercel.app/quran");
        let surahList = surahListRes.data;
        let surahData = surahList.data.find(
          (surah) =>
            surah.number === Number(surahInput) ||
            surah.asma.ar.short.toLowerCase() === surahInput.toLowerCase() ||
            surah.asma.en.short.toLowerCase() === surahInput.toLowerCase()
        );

        if (!surahData) {
          throw new Error(`Couldn't find surah with number or name "${surahInput}"`);
        }

        let res = await axios.get(`https://quran-endpoint.vercel.app/quran/${surahData.number}`);
        let json = res.data;
        let quranSurah = `
*Quran: The Holy Book*\n
*Surah ${json.data.number}: ${json.data.asma.ar.long} (${json.data.asma.en.long})*\n
Type: ${json.data.type.en}\n
Number of verses: ${json.data.ayahCount}\n
*Explanation:*\n
${json.data.tafsir.id}`;

        reply(quranSurah);

        if (json.data.recitation.full) {
          await Tayc.sendMessage(
            m.chat,
            {
              audio: { url: json.data.recitation.full },
              mimetype: "audio/mp4",
              ptt: true,
              fileName: `recitation.mp3`,
            },
            { quoted: m }
          );
        }
      } catch (error) {
        reply(`Error: ${error.message}`);
      }
    }
  },
];