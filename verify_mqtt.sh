#!/bin/bash

# Start the server in the background
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Create a trip
echo "Creating a trip..."
CREATE_RES=$(curl -s -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "expected_start_time": 1698400800000,
    "actual_start_time": null,
    "status": "SCHEDULED",
    "stops": [
      {
        "name": "Stop 1",
        "sequence": 1,
        "tasks": [
          {
            "task_type": "PICKUP",
            "sequence": 1,
            "task_name": "Pickup Task"
          }
        ]
      }
    ]
  }')

echo "Create Response: $CREATE_RES"

TRIP_ID=$(echo $CREATE_RES | grep -o '"id":[^,]*' | awk -F: '{print $2}')
echo "Created Trip ID: $TRIP_ID"

if [ -z "$TRIP_ID" ]; then
  echo "Failed to create trip"
  kill $SERVER_PID
  exit 1
fi

# Update the trip
echo "Updating trip $TRIP_ID..."
curl -s -X PUT http://localhost:5000/api/trips/$TRIP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "expected_start_time": 1698400800000,
    "actual_start_time": 1698401100000,
    "status": "STARTED",
    "stops": [
      {
        "name": "Stop 1",
        "sequence": 1,
        "tasks": [
          {
            "task_type": "PICKUP",
            "sequence": 1,
            "task_name": "Pickup Task"
          }
        ]
      }
    ]
  }'

# Wait a bit for MQTT publish log
sleep 2

# Kill server
kill $SERVER_PID
