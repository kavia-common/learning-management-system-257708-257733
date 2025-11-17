#!/bin/bash
cd /home/kavia/workspace/code-generation/learning-management-system-257708-257733/lms_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

