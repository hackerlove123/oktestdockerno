# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan

# Cài đặt curl, bash, và các công cụ cần thiết
RUN apk --no-cache add curl bash procps

# Cài đặt các module cần thiết bằng npm
RUN npm install --omit=dev --omit=optional hpack https commander colors socks

# Copy toàn bộ mã nguồn vào container
COPY . .

# Chạy vòng lặp vô hạn để gửi thông báo Telegram mỗi 10 giây
RUN while true; do \
    # Lấy thông tin về CPU và RAM
    TOTAL_CPU_CORES=$(grep -c ^processor /proc/cpuinfo); \
    TOTAL_RAM=$(free -m | awk '/Mem:/ {print $2}'); \
    USED_RAM=$(free -m | awk '/Mem:/ {print $3}'); \
    FREE_RAM=$(free -m | awk '/Mem:/ {print $4}'); \
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}'); \
    RAM_USAGE_PERCENT=$(echo "scale=2; ${USED_RAM} * 100 / ${TOTAL_RAM}" | bc); \
    FREE_RAM_PERCENT=$(echo "scale=2; ${FREE_RAM} * 100 / ${TOTAL_RAM}" | bc); \
    FREE_CPU_PERCENT=$(echo "scale=2; 100 - ${CPU_USAGE}" | bc); \
    \
    # Tạo nội dung thông báo
    MESSAGE="Server Docker đang chạy và hoạt động bình thường.\n\n" \
    MESSAGE="${MESSAGE}Tổng CPU Cores: ${TOTAL_CPU_CORES}\n" \
    MESSAGE="${MESSAGE}Tổng RAM: ${TOTAL_RAM} MB\n" \
    MESSAGE="${MESSAGE}% CPU đã sử dụng: ${CPU_USAGE}%\n" \
    MESSAGE="${MESSAGE}% RAM đã sử dụng: ${RAM_USAGE_PERCENT}%\n" \
    MESSAGE="${MESSAGE}% RAM còn trống: ${FREE_RAM_PERCENT}%\n" \
    MESSAGE="${MESSAGE}% CPU còn trống: ${FREE_CPU_PERCENT}%"; \
    \
    # Gửi thông báo đến Telegram
    curl -s -X POST "https://api.telegram.org/bot7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw/sendMessage" \
        -d chat_id="7371969470" \
        -d text="${MESSAGE}"; \
    \
    sleep 10; \
done & \
tail -f /dev/null
