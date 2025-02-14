# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan

# Cài đặt curl và các công cụ cần thiết
RUN apk --no-cache add curl bash

# Cài đặt các module cần thiết bằng npm
RUN npm install --omit=dev --omit=optional hpack https commander colors socks

# Copy toàn bộ mã nguồn vào container
COPY . .

# Chạy vòng lặp vô hạn để gửi thông báo Telegram mỗi 10 giây
RUN while true; do \
    curl -s -X POST "https://api.telegram.org/bot7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw/sendMessage" \
        -d chat_id="7371969470" \
        -d text="Server Docker đang chạy và hoạt động bình thường."; \
    sleep 10; \
done & \
tail -f /dev/null
