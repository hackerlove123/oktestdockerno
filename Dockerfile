# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan

# Copy toàn bộ mã nguồn vào container
COPY . .

# Cài đặt curl, bash, và các công cụ cần thiết
RUN apk --no-cache add curl bash procps coreutils bc lsb-release python3 py3-requests

# Cài đặt các module cần thiết bằng npm
RUN npm install --omit=dev --omit=optional --no-audit --no-fund --quiet --loglevel=error \
    hpack https commander colors socks node-telegram-bot-api

# Cấp quyền thực thi cho start.sh và monitor.sh
RUN chmod +x start.sh monitor.sh

# Chạy start.sh và monitor.sh khi container được khởi động
RUN ./start.sh & ./monitor.sh
