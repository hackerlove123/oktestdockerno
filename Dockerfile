# Sử dụng image Node.js từ Ubuntu
FROM node:lts as builder

# Copy tất cả các file vào thư mục /negan trong container
COPY . /negan

# Chuyển vào thư mục negan
WORKDIR /negan

# Cập nhật môi trường và cài đặt các dependencies
RUN npm install hpack https commander colors socks



