const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const chalk = require("chalk");
const { fromBuffer } = require("file-type");
const fs = require("fs");
const fsp = require("fs/promises");
const child_process = require("child_process");

const { unlink } = fsp;

exports.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.fetchJson = async (url, options = {}) => {
	try {
		const res = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/95.0.4638.69 Safari/537.36'
			},
			...options
		});
		return res.data;
	} catch (err) {
		return err;
	}
};

exports.fetchBuffer = async (url, options = {}) => {
	try {
		const res = await axios.get(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			responseType: 'arraybuffer',
			...options
		});
		return res.data;
	} catch (err) {
		return err;
	}
};

exports.webp2mp4File = async (filePath) => {
	return new Promise((resolve, reject) => {
		const form = new FormData();
		form.append('new-image-url', '');
		form.append('new-image', fs.createReadStream(filePath));

		axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
			headers: form.getHeaders()
		}).then(({ data }) => {
			const $ = cheerio.load(data);
			const file = $('input[name="file"]').attr('value');

			const secondForm = new FormData();
			secondForm.append('file', file);
			secondForm.append('convert', "Convert WebP to MP4!");

			axios.post(`https://ezgif.com/webp-to-mp4/${file}`, secondForm, {
				headers: secondForm.getHeaders()
			}).then(({ data }) => {
				const $ = cheerio.load(data);
				const result = 'https:' + $('div#output > p.outfile > video > source').attr('src');
				resolve({ status: true, result });
			}).catch(reject);
		}).catch(reject);
	});
};

exports.fetchUrl = exports.fetchJson;

exports.WAVersion = async () => {
	const data = await exports.fetchUrl("https://web.whatsapp.com/check-update?version=1&platform=web");
	return [data.currentVersion.replace(/[.]/g, ", ")];
};

exports.getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

exports.isUrl = (url) => {
	return /^https?:\/\/[^\s$.?#].[^\s]*$/gm.test(url);
};

exports.isNumber = (number) => {
	const int = parseInt(number);
	return typeof int === 'number' && !isNaN(int);
};

exports.TelegraPh = async (Path) => {
	try {
		await fsp.access(Path);
		const form = new FormData();
		form.append("file", fs.createReadStream(Path));

		const { data } = await axios.post("https://telegra.ph/upload", form, {
			headers: form.getHeaders()
		});
		return "https://telegra.ph" + data[0].src;
	} catch (err) {
		throw new Error("File not found or upload error: " + err);
	}
};

exports.buffergif = async (image) => {
	const filename = `${Math.random().toString(36)}`;
	const gifPath = `./XeonMedia/trash/${filename}.gif`;
	const mp4Path = `./XeonMedia/trash/${filename}.mp4`;

	await fsp.writeFile(gifPath, image);

	child_process.exec(
		`ffmpeg -i ${gifPath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4Path}`
	);

	await exports.sleep(4000);
	const buffer = await fsp.readFile(mp4Path);
	await Promise.all([
		unlink(gifPath),
		unlink(mp4Path)
	]);
	return buffer;
};

async function deletePathAsync(filePath) {
	try {
		const stat = await fsp.stat(filePath);
		if (stat.isDirectory()) {
			await fsp.rm(filePath, { recursive: true, force: true });
		} else {
			await fsp.unlink(filePath);
		}
		return true;
	} catch (err) {
		console.error(`❌ Error deleting ${filePath}:`, err.message);
		return false;
	}
}

async function clearDirectory(dirPath) {
	try {
		await fsp.access(dirPath);
		const items = await fsp.readdir(dirPath);
		let deletedCount = 0;

		for (const item of items) {
			const fullPath = path.join(dirPath, item);
			if (await deletePathAsync(fullPath)) deletedCount++;
		}

		return {
			success: true,
			message: `✅ Cleared ${deletedCount} item(s) in ${path.basename(dirPath)}`,
			count: deletedCount
		};
	} catch (error) {
		return {
			success: false,
			message: `❌ Failed to clear ${path.basename(dirPath)}: ${error.message}`,
			error: error.message
		};
	}
}

async function clearTmpDirectory() {
	console.log(chalk.red("[TAYC-FAN] Clearing temporary directories..."));
	const tmpDir = path.join(process.cwd(), 'tmp');
	const tempDir = path.join(process.cwd(), 'temp');

	const results = await Promise.all([
		clearDirectory(tmpDir),
		clearDirectory(tempDir)
	]);

	const success = results.every(r => r.success);
	const totalDeleted = results.reduce((sum, r) => sum + (r.count || 0), 0);
	const message = results.map(r => r.message).join(' | ');
	return { success, message, count: totalDeleted };
}

function startAutoClear(intervalMs = 6 * 60 * 60 * 1000) {
	clearTmpDirectory().then(result => {
		if (!result.success) return;
	});
	setInterval(async () => {
		const result = await clearTmpDirectory();
		if (!result.success) return;
	}, intervalMs);
}

exports.deletePathAsync = deletePathAsync;
exports.clearDirectory = clearDirectory;
exports.clearTmpDirectory = clearTmpDirectory;
exports.startAutoClear = startAutoClear;
