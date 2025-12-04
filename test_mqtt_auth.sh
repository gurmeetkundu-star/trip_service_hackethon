#!/bin/bash

echo "Testing MQTT connection to 172.236.95.200:8883"
echo "=============================================="
echo ""

# Test 1: Check if we can connect with current credentials
echo "Test 1: Attempting connection with prashant.singh / hackathon"
mosquitto_pub -h 172.236.95.200 -p 8883 -t "test/topic" -m "test message" \
    -u "prashant.singh" -P "hackathon" \
    --cafile ./certs/mqtt-ca.crt \
    -d

echo ""
echo "If this fails, you need to:"
echo "1. SSH into your Linode server: ssh root@172.236.95.200"
echo "2. Check your MQTT user configuration"
echo "3. For Mosquitto, check: /etc/mosquitto/passwd"
echo "4. Add user if needed: mosquitto_passwd -b /etc/mosquitto/passwd prashant.singh hackathon"
echo "5. Restart mosquitto: systemctl restart mosquitto"
