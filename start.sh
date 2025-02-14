#!/bin/bash

# Hàm để chạy một lệnh và tự động khởi động lại nếu nó dừng lại
run_command() {
    while true; do
        echo "Starting $1..."
        $2
        echo "$1 stopped. Restarting in 5 seconds..."
        sleep 5
    done
}

# Chạy bot.js trong nền và tự động khởi động lại nếu nó dừng
run_command "bot.js" "node bot.js" &

# Chạy prxscan.py trong nền và tự động khởi động lại nếu nó dừng
run_command "prxscan.py" "python3 prxscan.py -l list.txt" &

# Giữ container chạy
while true; do
    sleep 1
done
