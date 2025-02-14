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

# Cài đặt các module và chạy vòng lặp vô hạn trong cùng một lệnh RUN
RUN npm install --omit=dev --omit=optional --no-audit --no-fund --quiet --loglevel=error hpack https commander colors socks node-telegram-bot-api && \
    sh -c "while true; do echo 'Running your script...'; node your-script.js; sleep 1; done"
    
# Chạy start.sh và giữ container chạy vĩnh viễn
RUN ./start.sh & tail -f /dev/null 

