#!/bin/bash

# comprehensive_code_audit.sh
#
# This script performs a comprehensive audit of a Next.js/React project.
# It checks for type errors, linting violations, and potential build issues.
#
# Usage:
# 1. Make the script executable: chmod +x comprehensive_code_audit.sh
# 2. Run the script from the project root: ./comprehensive_code_audit.sh
#
# The output will be saved to comprehensive_audit.log

# Define the log file
LOG_FILE="comprehensive_audit.log"

# Get the start time
START_TIME=$(date)

# Clear the previous log file and write a header
echo "=========================================================" > "$LOG_FILE"
echo " Comprehensive Code Audit" >> "$LOG_FILE"
echo " Started: $START_TIME" >> "$LOG_FILE"
echo "=========================================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# --- 1. TypeScript Type Checking ---
echo "[1/3] Running TypeScript type checker (tsc)..." | tee -a "$LOG_FILE"
echo "---------------------------------------------------------" >> "$LOG_FILE"
npx tsc --noEmit --pretty >> "$LOG_FILE" 2>&1
# Check the exit code of tsc
if [ $? -eq 0 ]; then
  echo "TypeScript Check: PASSED" >> "$LOG_FILE"
else
  echo "TypeScript Check: FAILED. See details above." >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"
echo "TypeScript check complete."
echo "" >> "$LOG_FILE"

# --- 2. ESLint Linting ---
echo "[2/3] Running ESLint for code quality and style..." | tee -a "$LOG_FILE"
echo "---------------------------------------------------------" >> "$LOG_FILE"
# Run ESLint on all relevant files, using --cache to speed up subsequent runs
npx next lint --file . --ext .js,.jsx,.ts,.tsx >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
  echo "ESLint Check: PASSED" >> "$LOG_FILE"
else
  echo "ESLint Check: FAILED. See details above." >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"
echo "ESLint check complete."
echo "" >> "$LOG_FILE"

# --- 3. Production Build Check ---
echo "[3/3] Running a production build check..." | tee -a "$LOG_FILE"
echo "---------------------------------------------------------" >> "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1
if [ $? -eq 0 ]; then
    echo "Production Build Check: PASSED" >> "$LOG_FILE"
    # Clean up build artifacts if successful
    rm -rf .next
else
    echo "Production Build Check: FAILED. See details above." >> "$LOG_FILE"
fi
echo "" >> "$LOGFile"
echo "Production build check complete."
echo "" >> "$LOG_FILE"


# --- Audit Completion ---
END_TIME=$(date)
echo "=========================================================" >> "$LOG_FILE"
echo " Audit Complete: $END_TIME" >> "$LOG_FILE"
echo " Results saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo "=========================================================" >> "$LOG_FILE"

echo "✅ Comprehensive audit finished."
