#!/bin/bash

# Smoke Test Script for Brand Voice APIs
# Arquivo: scripts/smoke-test-brand-voice.sh

set -e

# Configuration
BASE_URL="${BRAND_VOICE_API_URL:-http://localhost:3000}"
TEST_ID="${TEST_BRAND_VOICE_ID:-123e4567-e89b-12d3-a456-426614174000}"
MAX_RESPONSE_TIME=2000  # 2 seconds in milliseconds

echo "🔍 Brand Voice API Smoke Test"
echo "================================"
echo "Base URL: $BASE_URL"
echo "Test ID: $TEST_ID"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: GET /api/brand-voice/{id}
echo "📡 Test 1: GET /api/brand-voice/$TEST_ID"
echo "----------------------------------------"

response=$(curl -sS -w '\n%{time_total}:%{http_code}:%{size_download}\n' \
  -H "Accept: application/json" \
  -H "x-bv-schema: v1.0.0" \
  "$BASE_URL/api/brand-voice/$TEST_ID" 2>/dev/null || echo "ERROR:999:0")

# Parse response
body=$(echo "$response" | head -n -1)
metrics=$(echo "$response" | tail -n 1)
time_total=$(echo "$metrics" | cut -d: -f1)
http_code=$(echo "$metrics" | cut -d: -f2)
size_download=$(echo "$metrics" | cut -d: -f3)

# Convert time to milliseconds
time_ms=$(echo "$time_total * 1000" | bc -l | cut -d. -f1)

echo "HTTP Status: $http_code"
echo "Response Time: ${time_ms}ms"
echo "Response Size: ${size_download} bytes"

# Validate response time
if [ "$time_ms" -gt "$MAX_RESPONSE_TIME" ]; then
  echo -e "${RED}❌ FAIL: Response time ${time_ms}ms > ${MAX_RESPONSE_TIME}ms${NC}"
  test1_result="FAIL"
else
  echo -e "${GREEN}✅ PASS: Response time within limit${NC}"
  test1_result="PASS"
fi

# Validate HTTP status
if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ PASS: HTTP 200 OK${NC}"
elif [ "$http_code" = "404" ]; then
  echo -e "${YELLOW}⚠️  WARN: HTTP 404 - Test ID not found (acceptable for test)${NC}"
  test1_result="WARN"
else
  echo -e "${RED}❌ FAIL: HTTP $http_code${NC}"
  test1_result="FAIL"
fi

echo ""

# Test 2: POST /api/brand-voice/validate
echo "📡 Test 2: POST /api/brand-voice/validate"
echo "----------------------------------------"

# Sample payload for validation
payload='{
  "id": "'$TEST_ID'",
  "version": "v1.0.0",
  "tone": "casual",
  "vocabulary": {
    "preferred": ["pet", "amor"],
    "avoid": ["vender"]
  },
  "style_guides": [],
  "examples": []
}'

response2=$(curl -sS -w '\n%{time_total}:%{http_code}:%{size_download}\n' \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$payload" \
  "$BASE_URL/api/brand-voice/validate" 2>/dev/null || echo "ERROR:999:0")

# Parse response
body2=$(echo "$response2" | head -n -1)
metrics2=$(echo "$response2" | tail -n 1)
time_total2=$(echo "$metrics2" | cut -d: -f1)
http_code2=$(echo "$metrics2" | cut -d: -f2)
size_download2=$(echo "$metrics2" | cut -d: -f3)

time_ms2=$(echo "$time_total2 * 1000" | bc -l | cut -d. -f1)

echo "HTTP Status: $http_code2"
echo "Response Time: ${time_ms2}ms"
echo "Response Size: ${size_download2} bytes"

# Validate response
if [ "$http_code2" = "200" ] || [ "$http_code2" = "400" ]; then
  echo -e "${GREEN}✅ PASS: Validation endpoint responding${NC}"
  test2_result="PASS"
else
  echo -e "${RED}❌ FAIL: Validation endpoint error HTTP $http_code2${NC}"
  test2_result="FAIL"
fi

echo ""

# Test 3: Schema Validation (if response contains JSON)
echo "📡 Test 3: Response Schema Validation"
echo "------------------------------------"

if [ "$http_code" = "200" ] && [ "$size_download" -gt 10 ]; then
  # Basic JSON validation
  if echo "$body" | jq empty > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Valid JSON response${NC}"
    
    # Check for required fields
    has_id=$(echo "$body" | jq -r '.id // empty')
    has_version=$(echo "$body" | jq -r '.version // empty')
    has_tone=$(echo "$body" | jq -r '.tone // empty')
    
    if [ -n "$has_id" ] && [ -n "$has_version" ] && [ -n "$has_tone" ]; then
      echo -e "${GREEN}✅ PASS: Required fields present${NC}"
      test3_result="PASS"
    else
      echo -e "${YELLOW}⚠️  WARN: Some required fields missing${NC}"
      test3_result="WARN"
    fi
  else
    echo -e "${RED}❌ FAIL: Invalid JSON response${NC}"
    test3_result="FAIL"
  fi
else
  echo -e "${YELLOW}⚠️  SKIP: No valid response to validate${NC}"
  test3_result="SKIP"
fi

echo ""

# Test 4: Availability Check (SLA requirement: ≥ 99.5%)
echo "📡 Test 4: Availability Check"
echo "----------------------------"

total_tests=0
successful_tests=0

# Multiple quick requests to check consistency
for i in {1..5}; do
  total_tests=$((total_tests + 1))
  quick_response=$(curl -sS -w '%{http_code}' -o /dev/null --max-time 3 \
    "$BASE_URL/api/brand-voice/health" 2>/dev/null || echo "000")
  
  if [ "$quick_response" = "200" ] || [ "$quick_response" = "404" ]; then
    successful_tests=$((successful_tests + 1))
  fi
  
  echo -n "."
done

echo ""

availability=$(echo "scale=1; $successful_tests * 100 / $total_tests" | bc -l)
echo "Availability: ${availability}% ($successful_tests/$total_tests)"

if [ "$successful_tests" -ge 5 ]; then
  echo -e "${GREEN}✅ PASS: High availability${NC}"
  test4_result="PASS"
else
  echo -e "${RED}❌ FAIL: Low availability${NC}"
  test4_result="FAIL"
fi

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo "Test 1 (GET endpoint): $test1_result"
echo "Test 2 (POST validation): $test2_result"
echo "Test 3 (Schema validation): $test3_result"
echo "Test 4 (Availability): $test4_result"

# Overall result
if [ "$test1_result" = "FAIL" ] || [ "$test2_result" = "FAIL" ] || [ "$test4_result" = "FAIL" ]; then
  echo -e "\n${RED}❌ OVERALL: FAIL - Critical issues detected${NC}"
  exit 1
elif [ "$test1_result" = "WARN" ] || [ "$test3_result" = "WARN" ]; then
  echo -e "\n${YELLOW}⚠️  OVERALL: WARN - Some issues detected${NC}"
  exit 2
else
  echo -e "\n${GREEN}✅ OVERALL: PASS - All tests successful${NC}"
  exit 0
fi