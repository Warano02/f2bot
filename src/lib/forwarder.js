const path = require("path");
const { LOADSETTINGS } = require("../../lib/myfunc");
const fs = require("fs");
const ALL_SETTINGS_PATH = path.join(__dirname, "../db/settings.json");

// Blacklist en mémoire
const inMemoryBlacklist = new Map();

// Limite fixée à la taille max d’un groupe WhatsApp
const MAX_JID_LIMIT = 1024;

let globalForwardState = {
    isRunning: false,
    stopSignal: false,
    sent: 0,
    error: 0,
    total: 0,
    est: undefined
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function estimateForwardTime(count) {
    const base = 15; // seconds
    const jitter = 8; // ±4s
    const pauseEvery = 50;
    const pauseDuration = 4.5 * 60; // secondes (~4.5 min)
    const fullPauseCount = Math.floor(count / pauseEvery);
    const total = count * (base + jitter / 2) + fullPauseCount * pauseDuration;

    return {
        seconds: Math.round(total),
        human: msToTime(total * 1000)
    };
}

function msToTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

function getForwardStatus() {
    return globalForwardState.isRunning
        ? {
            ...globalForwardState,
            remaining: globalForwardState.total - globalForwardState.sent
        }
        : null;
}

function MakeItGlobal() {
    global.globalForwardState = globalForwardState;
}

function stopForwarding() {
    globalForwardState.stopSignal = true;
    MakeItGlobal();
    return true;
}

function getDynamicDelay(index) {
    const base = 15000; // 15s
    const jitter = Math.random() * 8000 - 4000; // ±4s
    const progressive = Math.min(index * 20, 4000); // ajoute 20ms/envoi, max 4s
    return base + jitter + progressive;
}

/**
 * 
 * @param {import("@whiskeysockets/baileys").SocketConfig} Tayc 
 * @param {Array<String>} Jids 
 * @param {String} mess 
 * @returns Object
 */
async function FORWARDMESSAGE(Tayc, Jids, mess) {
    if (Jids.length > MAX_JID_LIMIT) {
        return { error: true, msg: `*Too many recipients. WhatsApp group limit is ${MAX_JID_LIMIT}.*` };
    }

    if (globalForwardState.isRunning) {
        return { error: true, msg: '*A forward is already in progress.*' };
    }

    const settings = LOADSETTINGS();
    const lastForwarding = new Date(settings.lastforwarding);
    const diff = Date.now() - lastForwarding.getTime();

    const cooldownMinutes = Math.ceil(Jids.length / 10);
    if (diff < cooldownMinutes * 60 * 1000) {
        return {
            error: true,
            msg: `*Please wait ${cooldownMinutes} minutes before next broadcast.*`
        };
    }

    const validJids = Jids.filter(jid => !inMemoryBlacklist.has(jid));
    const est = estimateForwardTime(validJids.length);

    globalForwardState = {
        isRunning: true,
        stopSignal: false,
        sent: 0,
        error: 0,
        total: validJids.length,
        est: est.human
    };

    const success = [], error = [];

    for (let i = 0; i < validJids.length; i++) {
        const jid = validJids[i];
        if (globalForwardState.stopSignal) break;

        try {
            await Tayc.sendMessage(jid, { text: mess });
            success.push(jid);
            globalForwardState.sent++;
        } catch (e) {
            error.push(jid);
            globalForwardState.error++;

            if (
                e.message?.includes("user-not-found") ||
                e.message?.includes("blocked") ||
                e.message?.includes("not-authorized")
            ) {
                inMemoryBlacklist.set(jid, new Date());
            }
        }

        if (i > 0 && i % 50 === 0) {
            const pause = (3 + Math.random() * 3) * 60 * 1000; // 3 à 6 min
            await sleep(pause);
        } else {
            await sleep(getDynamicDelay(i)); // 15s à ~22s
        }

        MakeItGlobal();
    }

    globalForwardState.isRunning = false;
    globalForwardState.stopSignal = false;
    globalForwardState.est = undefined;
    MakeItGlobal();

    fs.writeFileSync(
        ALL_SETTINGS_PATH,
        JSON.stringify({ ...settings, lastforwarding: new Date() }, null, 2)
    );

    const response = `✅ *Forward complete*\n- Success: ${success.length}\n- Error: ${error.length}\n\n🧾 Success: ${success
        .map(j => '@' + j.split('@')[0])
        .join('\n')}\n\n❌ Error: ${error.map(j => '@' + j.split('@')[0]).join('\n')}`;

    Tayc.sendMessage(Tayc.user.id, {
        text: response,
        mentions: [...success, ...error]
    });

    return { success, error };
}

module.exports = {
    FORWARDMESSAGE,
    estimateForwardTime,
    getForwardStatus,
    stopForwarding
};
