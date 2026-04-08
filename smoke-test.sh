#!/bin/bash

# Zenith Smoke Test Script
# Verifies core services are up and reachable

# Default URLs (can be overridden via environment variables)
BACKEND_URL=${BACKEND_URL:-"http://localhost:4000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
MAX_RETRIES=5
RETRY_INTERVAL=5

echo "🚀 Starting Zenith Smoke Test..."
echo "-----------------------------------"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "-----------------------------------"

# Function to check health
check_health() {
  local url=$1
  local name=$2
  local expected_status=$3
  local retries=0

  while [ $retries -lt $MAX_RETRIES ]; do
    echo "🔍 Checking $name health (Attempt $((retries+1))/$MAX_RETRIES)..."
    
    # Use curl to check status code
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$STATUS_CODE" -eq "$expected_status" ]; then
      echo "✅ $name is UP (Status: $STATUS_CODE)"
      return 0
    fi

    echo "⚠️ $name not ready yet (Status: $STATUS_CODE). Retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
    retries=$((retries+1))
  done

  echo "❌ $name failed health check after $MAX_RETRIES attempts."
  return 1
}

# 1. Check Backend Health Endpoint
check_health "$BACKEND_URL/health" "Backend API" 200
BACKEND_RESULT=$?

# 2. Check Frontend Accessibility
check_health "$FRONTEND_URL" "Frontend UI" 200
FRONTEND_RESULT=$?

# 3. Check if Backend can talk to DB/Redis (optional but recommended)
# Note: This checks the response body of the /health endpoint
echo "🔍 Checking Backend Dependencies..."
HEALTH_BODY=$(curl -s "$BACKEND_URL/health")
if [[ $HEALTH_BODY == *"\"status\":\"ok\""* ]]; then
  echo "✅ Backend internal status is OK"
else
  echo "❌ Backend reports internal issues: $HEALTH_BODY"
  BACKEND_RESULT=1
fi

echo "-----------------------------------"
if [ $BACKEND_RESULT -eq 0 ] && [ $FRONTEND_RESULT -eq 0 ]; then
  echo "🎉 SMOKE TEST PASSED!"
  exit 0
else
  echo "🚨 SMOKE TEST FAILED!"
  exit 1
fi
