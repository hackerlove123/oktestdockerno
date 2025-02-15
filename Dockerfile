 # Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan

# Copy toàn bộ mã nguồn vào container
COPY . .

# Cài đặt curl, bash, và các công cụ cần thiết
RUN apk --no-cache add curl bash procps

# Cài đặt pip3 và requests
RUN apk --no-cache add python3 py3-requests

# Cài đặt các module cần thiết bằng npm 
RUN npm install --omit=dev --omit=optional --no-audit --no-fund --quiet --loglevel=error hpack https commander colors socks node-telegram-bot-api

# Cấp quyền thực thi cho start.sh
RUN chmod +x start.sh 

# Chạy start.sh và giữ container chạy vĩnh viễn
RUN ./start.sh & \
    tail -f /path/to/logfile & \
    while true; do \
        echo 'Running multiple tasks...'; \
        echo 'Current time: $(date)' >> /var/log/myapp.log; \
        ping -c 1 google.com; \
        ps aux; \
        sleep 1; \
    done & \
    wait

        ping -c 1 google.com; \
        ps aux; \
        sleep 1; \
    done & \
    sleep infinity" &
