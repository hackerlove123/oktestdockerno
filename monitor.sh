#!/bin/bash

while true; do
    OS_NAME=$(uname -o)
    OS_FULL_NAME=$(lsb_release -d 2>/dev/null | awk -F'\t' '{print $2}' || echo "$OS_NAME")
    TOTAL_RAM_MB=$(free -m | awk '/Mem:/ {print $2}')
    FREE_RAM_MB=$(free -m | awk '/Mem:/ {print $4}')
    USED_RAM_MB=$((TOTAL_RAM_MB - FREE_RAM_MB))
    TOTAL_RAM_GB=$(echo "scale=2; $TOTAL_RAM_MB / 1024" | bc)
    FREE_RAM_GB=$(echo "scale=2; $FREE_RAM_MB / 1024" | bc)
    USED_RAM_GB=$(echo "scale=2; $USED_RAM_MB / 1024" | bc)
    RAM_FREE_PERCENT=$(awk "BEGIN {printf \"%.2f\", ($FREE_RAM_MB / $TOTAL_RAM_MB) * 100}")
    RAM_USED_PERCENT=$(awk "BEGIN {printf \"%.2f\", ($USED_RAM_MB / $TOTAL_RAM_MB) * 100}")
    TOTAL_CPU_CORES=$(nproc)
    CPU_USAGE=$(top -bn1 | awk '/Cpu/ {print $2}')

    echo "=== HỆ THỐNG ==="
    echo "🖥 Hệ điều hành: $OS_FULL_NAME"
    echo "💻 Tổng CPU Core: $TOTAL_CPU_CORES"
    echo "🏗 Tổng RAM: ${TOTAL_RAM_GB}GB"
    echo "🔥 % CPU đã dùng: ${CPU_USAGE}%"
    echo "💾 RAM đã dùng: ${USED_RAM_GB}GB (${RAM_USED_PERCENT}%)"
    echo "=== TIẾN TRÌNH SỬ DỤNG NHIỀU RAM NHẤT ==="
    ps aux --sort=-%mem | head -n 10 | awk '{printf "%-10s %-8s %-6s %-8s %-10s %-10s %-10s %-10s %-10s %-10s %s\n", $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11}'
    echo "=== KẾT THÚC ==="
    echo "--------------------------------------"
    sleep 7
done
