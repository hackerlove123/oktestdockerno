const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const os = require('os');

const token = '7534473375:AAFqGHiHPT0HyzmAkQ7TxoYTFL3KVU0SdEM';
const bot = new TelegramBot(token, { polling: true });
const adminId = 7371969470;

// Hàm lấy thông số CPU và RAM
const getSystemStats = () => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    const cpuUsagePercent = (os.cpus().reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + (100 - (idle / total) * 100);
    }, 0) / os.cpus().length).toFixed(2);
    return { memoryUsagePercent, cpuUsagePercent, totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(0), freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(0) };
};

// Gửi thông số CPU và RAM mỗi 14 giây
setInterval(() => {
    const stats = getSystemStats();
    const cpuFreePercent = (100 - parseFloat(stats.cpuUsagePercent)).toFixed(2);
    bot.sendMessage(adminId, `
Thông số đã sử dụng: 🚀 
- CPU đã sử dụng: ${stats.cpuUsagePercent}%
- RAM đã sử dụng: ${stats.memoryUsagePercent}%

Thông số còn trống: ❤️
- CPU còn trống: ${cpuFreePercent}%
- RAM còn trống: ${stats.freeMemory}GB
- Tổng RAM: ${stats.totalMemory}GB
    `);
}, 14000);

// Xử lý lệnh từ admin
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Chỉ admin mới được thực hiện lệnh
    if (chatId !== adminId) {
        return bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');
    }

    // Kiểm tra xem lệnh có bắt đầu bằng "exe" không
    if (!text.startsWith('exe ')) {
        return bot.sendMessage(chatId, 'Lệnh không hợp lệ. Vui lòng bắt đầu lệnh với "exe".');
    }

    // Lấy lệnh thực tế (bỏ qua "exe ")
    const command = text.slice(4).trim();

    // Nếu lệnh trống sau khi bỏ "exe"
    if (!command) {
        return bot.sendMessage(chatId, 'Lệnh không được để trống. Ví dụ: "exe ls"');
    }

    console.log(`[DEBUG] Lệnh được thực thi: ${command}`);

    // Gửi thông báo đang thực thi lệnh
    bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);

    // Sử dụng exec để thực thi lệnh
    const child = exec(command);

    // Xử lý stdout và stderr
    const handleOutput = (data, type) => {
        const output = data.toString();
        console.log(`[DEBUG] ${type}: ${output}`); // Debug ra console
        bot.sendMessage(chatId, JSON.stringify({ type, output }, null, 2)); // Gửi về Telegram dưới dạng JSON
    };

    child.stdout.on('data', (data) => handleOutput(data, 'stdout'));
    child.stderr.on('data', (data) => handleOutput(data, 'stderr'));

    // Xử lý khi lệnh kết thúc
    child.on('close', (code) => {
        console.log(`[DEBUG] Lệnh đã kết thúc với mã thoát: ${code}`);
        bot.sendMessage(chatId, JSON.stringify({ exitCode: code }, null, 2)); // Gửi mã thoát về Telegram dưới dạng JSON
    });
});
