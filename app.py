from flask import Flask, request, jsonify, send_from_directory
import subprocess
import platform
import os
import json

app = Flask(__name__, static_folder='static')

is_windows = platform.system() == "Windows"
exe_name = "scheduler.exe" if is_windows else "scheduler"
exe_path = os.path.join("build", exe_name)
if is_windows and not os.path.exists(exe_path):
    exe_path = os.path.join("build", "Debug", exe_name)


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/test/<path:filename>')
def test_scenarios(filename):
    return send_from_directory('test', filename)


@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Receives a JSON payload from the browser with the process workload,
    passes it as a JSON string to the C++ scheduler engine via stdin,
    and returns the scheduler's JSON output to the browser.

    Expected Input JSON schema:
    {
      "time_quantum": int,
      "priority_rule": "lower_is_higher" | "larger_is_higher",
      "num_processes": int,
      "processes": [
        { "process_id": str, "arrival_time": int, "burst_time": int, "priority": int },
        ...
      ]
    }

    Expected Output JSON schema (from C++ stdout):
    {
      "round_robin": {
        "gantt_chart": [ { "process_id": str, "start_time": int, "end_time": int }, ... ],
        "metrics":    [ { "process_id": str, "waiting_time": int, "turnaround_time": int, "response_time": int }, ... ],
        "averages":   { "avg_wt": float, "avg_tat": float, "avg_rt": float }
      },
      "priority_preemptive": { ... same structure ... }
    }
    """
    user_data = request.get_json(force=True)

    if not user_data:
        return jsonify({"error": "No JSON payload received."}), 400

    input_string = json.dumps(user_data)

    try:
        result = subprocess.run(
            [exe_path],
            input=input_string,
            text=True,
            capture_output=True,
            timeout=10,          
            check=True           
        )

        cpp_output_json = json.loads(result.stdout)
        return jsonify(cpp_output_json)

    except FileNotFoundError:
        return jsonify({
            "error": f"Scheduler executable not found at '{exe_path}'. "
                     "Please build the C++ backend first: cd build && cmake --build ."
        }), 500

    except subprocess.CalledProcessError as e:
        err_msg = e.stderr.strip() if e.stderr else "Unknown C++ runtime error."
        return jsonify({"error": f"Scheduler engine error: {err_msg}"}), 500

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Scheduler engine timed out after 10 seconds."}), 500

    except json.JSONDecodeError as e:
        raw = result.stdout[:500] if result.stdout else "(empty)"
        return jsonify({
            "error": f"Failed to parse scheduler output as JSON. "
                     f"Parser said: {str(e)}. Raw output: {raw}"
        }), 500

    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500


@app.route('/api/update-chart', methods=['POST'])
def update_chart_legacy():
    return jsonify({"error": "This endpoint is deprecated. Use /api/simulate instead."}), 410


if __name__ == '__main__':
    print("🚀 Starting Flask API on http://localhost:5000")
    print(f"   C++ executable path: {os.path.abspath(exe_path)}")
    app.run(debug=True, port=5000)