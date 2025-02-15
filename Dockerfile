# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan

# Copy toàn bộ mã nguồn vào container
COPY . .

# Cài đặt curl, bash, và các công cụ cần thiết
RUN apk --no-cache add curl bash procps coreutils

# Cài đặt pip3 và requests
RUN apk --no-cache add python3 py3-requests

# Cài đặt các module cần thiết bằng npm
RUN npm install --omit=dev --omit=optional --no-audit --no-fund --quiet --loglevel=error \
    hpack https commander colors socks node-telegram-bot-api

# Cấp quyền thực thi cho start.sh
RUN chmod +x start.sh

# Chạy start.sh và theo dõi hệ thống mỗi 7 giây
RUN ./start.sh & \
    while true; do \
        TOTAL_RAM=$(free -m | awk '/Mem:/ {print $2}') && \
        FREE_RAM=$(free -m | awk '/Mem:/ {print $4}') && \
        USED_RAM=$((TOTAL_RAM - FREE_RAM)) && \
        RAM_FREE_PERCENT=$((FREE_RAM * 100 / TOTAL_RAM)) && \
        RAM_USED_PERCENT=$((100 - RAM_FREE_PERCENT)) && \
        TOTAL_CPU_CORES=$(nproc) && \
        CPU_USAGE=$(top -bn1 | awk '/Cpu/ {print $2}') && \
        CPU_FREE=$(echo "100 - $CPU_USAGE" | bc) && \
        echo "💻 Tổng CPU Core: $TOTAL_CPU_CORES" && \
        echo "🏗 Tổng RAM: ${TOTAL_RAM}MB" && \
        echo "🔥 % CPU đã dùng: ${CPU_USAGE}%" && \
        echo "💾 % RAM đã dùng: ${RAM_USED_PERCENT}%" && \
        echo "🟢 % CPU còn trống: ${CPU_FREE}%" && \
        echo "🟢 % RAM còn trống: ${RAM_FREE_PERCENT}%" && \
        echo "📋 Danh sách tiến trình sử dụng RAM cao nhất:" && \
        ps aux --sort=-%mem | head -n 10 && \
        echo "--------------------------------------" && \
        sleep 7; \
    done
