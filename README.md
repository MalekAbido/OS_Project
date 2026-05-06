# Operating Systems Project: Round Robin vs Priority Scheduling

This repository contains the simulator for the Operating Systems course project (C3: Round Robin vs Priority). The goal of this project is to simulate and compare the performance, fairness, and starvation risks of a Round Robin scheduler versus a Preemptive Priority scheduler using a unified workload.

## 🏗 Architecture

This project uses a real-time **CLI Pipeline** architecture to separate the core algorithms from the user interface:

1. **Frontend (HTML/JS/CSS):** A web interface hosted in the `static/` directory that handles user input, strict validation, and rendering Gantt charts/results tables.
2. **Middleware (Python/Flask):** A lightweight API (`app.py`) that serves the webpage, catches the frontend's data, and passes it directly to the C++ core.
3. **Backend (C++):** The core scheduling engine (`main.cpp`). It reads a JSON string from standard input, runs both algorithms, and prints the results as a JSON string to standard output.

## ⚙️ Prerequisites

Every team member needs the following installed on their system (Windows or Linux):

* **Git**
* **C++ Compiler**
* **CMake**
* **Python 3.x**

## 🚀 Setup & Installation

### 1. Clone the Repository

```
git clone https://github.com/MalekAbido/OS_Project.git
cd OS_Project

```

### 2. Set Up the Python Virtual Environment

To keep dependencies clean, we use a virtual environment.

**Linux/macOS:**

```
python3 -m venv flaskenv
source flaskenv/bin/activate
pip install -r requirements.txt

```

**Windows:**

```
python -m venv flaskenv
flaskenv\Scripts\activate
pip install -r requirements.txt

```

### 3. Build the C++ Backend

Use CMake to compile the C++ scheduling engine. This step works exactly the same on Linux and Windows.

```
mkdir build
cd build
cmake ..
cmake --build .
cd ..

```

## 🏃‍♂️ Running the Simulator

Whenever you want to test the application, make sure your virtual environment is activated, then start the Flask server:

```
python app.py

```

Open your web browser and go to  **`http://localhost:5000`** .

*(Note: As you make changes to the HTML/JS, you can just refresh the browser. If you make changes to the C++ code, you must rerun `cmake --build .` inside the `build` folder).*

## 📜 Data Contract (JSON Schemas)

For the frontend and backend teams to work independently, we enforce a strict JSON data structure.

### Input Data Example (Sent from UI to C++ `stdin`)

```
{
  "time_quantum": 4,
  "priority_rule": 0, // 0="lower_is_higher", 1="larger_is_higher"
  "num_processes": 1, 
  "processes": [
    {
      "process_id": "P1",
      "arrival_time": 0,
      "burst_time": 8,
      "priority": 3
    }
  ]
}

```

### Output Data Example (Printed from C++ `stdout` to UI)

```
{
  "round_robin": {
    "gantt_chart": [
      {"process_id": "P1", "start_time": 0, "end_time": 4}
    ],
    "metrics": [
      {"process_id": "P1", "waiting_time": 8, "turnaround_time": 16, "response_time": 0}
    ],
    "averages": {
      "avg_wt": 7.00,
      "avg_tat": 14.00,
      "avg_rt": 3.00
    }
  },
  "priority_preemptive": {
    "gantt_chart": [
      {"process_id": "P1", "start_time": 0, "end_time": 1}
    ],
    "metrics": [
      {"process_id": "P1", "waiting_time": 13, "turnaround_time": 21, "response_time": 0}
    ],
    "averages": {
      "avg_wt": 5.33,
      "avg_tat": 12.33,
      "avg_rt": 1.00
    }
  }
}

```
