from flask import Flask, request, jsonify, send_from_directory
import subprocess
import platform
import os
import json

app = Flask(__name__, static_folder='static')

# Find the C++ executable path based on OS
is_windows = platform.system() == "Windows"
exe_name = "scheduler.exe" if is_windows else "scheduler"
exe_path = os.path.join("build", exe_name)
if is_windows and not os.path.exists(exe_path):
    exe_path = os.path.join("build", "Debug", exe_name)

@app.route('/')
def index():
    # Serve the index.html file when someone visits localhost:5000
    return send_from_directory('static', 'index.html')

@app.route('/api/update-chart', methods=['POST'])
def update_chart():
    # 1. Get the JSON data sent from the browser
    user_data = request.json
    
    # 2. Format it into a simple string separated by spaces for C++ stdin
    input_string = f"{user_data['val1']} {user_data['val2']} {user_data['val3']}\n"
    
    try:
        # 3. Run the C++ executable, feed it the string, and grab the output
        result = subprocess.run(
            [exe_path], 
            input=input_string, 
            text=True, 
            capture_output=True, 
            check=True
        )
        
        # 4. The C++ printed a JSON string. Parse it and send it to the browser.
        cpp_output_json = json.loads(result.stdout)
        return jsonify(cpp_output_json)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask API on http://localhost:5000")
    app.run(debug=True, port=5000)