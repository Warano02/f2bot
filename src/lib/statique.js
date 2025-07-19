const chalk = require('chalk');

function logMessage({ number, name, messageType, chatId, text }) {
    const timestamp = new Date(Number(Date.now()) * 1000);
    const decoratedName = `『 TAYC MD 』`;
    const remaining = 50 - decoratedName.length;
    const side = "†" + '━'.repeat(Math.floor(remaining / 2));
    const header = chalk.hex('#FFAA00')(side + decoratedName + side.replace("†", "").replace("", "").concat("╮"));

    const label = (txt) => chalk.green.bold(`» ${txt.padEnd(14)}: `);
    const footer = chalk.hex('#FF00FF')('╰' + '━'.repeat(50) + '╯');

    const fields = [
        `${label('Sent Time')}${chalk.white(timestamp.toLocaleString('en-GB', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }))} EAT`,
        `${label('Message Type')}${chalk.hex('#FF6600')(messageType)}`,
        `${label('Sender')}${chalk.yellow(number)}`,
        `${label('Name')}${chalk.redBright(name)}`,
        `${label('Chat ID')}${chalk.cyan(chatId)}`,
        `${label('Message')}${chalk.reset(text || '[No text]')}`
    ];

    console.log(['\n' + header, ...fields, footer].join('\n'));
}


module.exports = logMessage;
