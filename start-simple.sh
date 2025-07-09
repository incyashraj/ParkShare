#!/bin/bash

echo "🚀 Starting ParkShare - Simple Method"

# Kill any existing processes
echo "Cleaning up..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
sleep 2

# Check backend
echo "Checking backend..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Backend is running on port 3001"
else
    echo "❌ Backend not running, starting it..."
    cd /Users/yashrajpardeshi/ParkShare/backend
    npm start &
    sleep 5
fi

# Start frontend
echo "Starting frontend..."
cd /Users/yashrajpardeshi/ParkShare/frontend

# Create a simple HTML file as backup
cat > /tmp/parkshare-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>ParkShare Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 20px; border: 1px solid #ddd; margin: 10px 0; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        button { padding: 10px 20px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🅿️ ParkShare Test Page</h1>
        <div id="status" class="status">Testing connections...</div>
        
        <h2>Backend API Test</h2>
        <button onclick="testBackend()">Test Backend Connection</button>
        
        <h2>Quick Login Test</h2>
        <form id="loginForm">
            <input type="email" placeholder="Email" value="test@example.com" id="email"><br>
            <input type="password" placeholder="Password" value="password123" id="password"><br>
            <button type="submit">Test Login</button>
        </form>
        
        <div id="result"></div>
    </div>

    <script>
        async function testBackend() {
            const status = document.getElementById('status');
            try {
                const response = await fetch('http://localhost:3001/api/users');
                if (response.ok) {
                    status.innerHTML = '✅ Backend API is working!';
                    status.className = 'status success';
                } else {
                    status.innerHTML = '❌ Backend API error: ' + response.status;
                    status.className = 'status error';
                }
            } catch (error) {
                status.innerHTML = '❌ Cannot connect to backend: ' + error.message;
                status.className = 'status error';
            }
        }

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const result = document.getElementById('result');
            
            try {
                const response = await fetch('http://localhost:3001/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                result.innerHTML = response.ok ? 
                    '✅ Login successful!' : 
                    '❌ Login failed: ' + data.message;
            } catch (error) {
                result.innerHTML = '❌ Login error: ' + error.message;
            }
        });

        // Test backend on load
        window.onload = testBackend;
    </script>
</body>
</html>
EOF

# Try to start React app
echo "Starting React development server..."
PORT=3000 npm start &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "Waiting for frontend to start..."
sleep 15

# Check if frontend is responding
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend not responding on port 3000"
    echo "🔧 Opening backup test page..."
    
    # Start a simple Python server as backup
    cd /tmp
    python3 -m http.server 8000 &
    PYTHON_PID=$!
    
    echo "📱 Backup test page: http://localhost:8000/parkshare-test.html"
    echo "🌐 Try this URL in your browser to test the backend API"
fi

echo ""
echo "🎯 URLs to try:"
echo "• Main app: http://localhost:3000"
echo "• Backend API: http://localhost:3001"
echo "• Test page: http://localhost:8000/parkshare-test.html"
echo ""
echo "Press Ctrl+C to stop"

# Keep running
wait