#!/bin/bash

# Chạy api.js trong nền
node bot.js &

# Chạy prxscan.py trong nền
python3 prxscan.py -l list.txt &



# Giữ container chạy
while true; do
    sleep 1
done
