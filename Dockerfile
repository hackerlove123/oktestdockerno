# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan
# Cài đặt các module cần thiết bằng npm, chỉ cài đặt dependencies không phải là dev và optional
RUN npm install --omit=dev --omit=optional hpack https commander colors socks

# Copy toàn bộ mã nguồn sau khi cài đặt dependencies
COPY . .

# Chạy lệnh node với tham số truyền vào
RUN node ./negan -m GET -u https://muahack.com -p 1.txt --full true -s 10
