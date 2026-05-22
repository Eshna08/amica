#!/bin/bash

# Startup script for Zenify RAG and MCP APIs

echo "Starting Zenify Mental Health APIs..."

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip and install setuptools first
echo "Upgrading pip and installing setuptools..."
pip install --upgrade pip setuptools wheel

# Install requirements with more lenient versions
echo "Installing Python dependencies..."
cd rag
pip install --no-cache-dir fastapi uvicorn scikit-learn joblib pydantic
cd ..

# Install MCP requirements
cd MCP
pip install --no-cache-dir fastapi uvicorn joblib scikit-learn pydantic
cd ..

# Start MCP API (Simple suicide classification)
echo "Starting MCP API on port 8001..."
cd MCP
uvicorn mcpapi:app --host 0.0.0.0 --port 8001 &
MCP_PID=$!
cd ..

# Start Enhanced RAG API (Comprehensive analysis)  
echo "Starting Enhanced RAG API on port 8002..."
cd rag
uvicorn simplified_suicide_detection_api:app --host 0.0.0.0 --port 8002 &
RAG_PID=$!
cd ..

echo "APIs started successfully!"
echo "MCP API: http://localhost:8001"
echo "Enhanced RAG API: http://localhost:8002"
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping APIs..."
    kill $MCP_PID 2>/dev/null
    kill $RAG_PID 2>/dev/null
    echo "APIs stopped."
    exit 0
}

# Trap SIGINT (Ctrl+C) and cleanup
trap cleanup SIGINT

# Wait for all background processes
wait
