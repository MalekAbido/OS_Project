# CPU Scheduling Simulator

## 1. Architecture Overview

The project implements a web-based CPU scheduling simulator comparing **Round Robin** and **Preemptive Priority** algorithms. It utilizes a three-tier architecture to separate the computational scheduling logic from the user interface:

- **Backend Engine:** C++ (High-performance scheduling logic)
- **Middleware API:** Python / Flask (Process management and routing)
- **Frontend Visualization:** HTML, JavaScript, and Tailwind CSS (User interface and rendering)

## 2. Programming Languages & Libraries Used

- **C++:** Used for the core scheduling algorithms to ensure fast execution and precise memory management.
  - `nlohmann/json` (`json.hpp`): Used for parsing incoming simulation parameters and formatting the output metrics as structured JSON data.
- **Python (Flask):** Serves as a lightweight web server.
  - `subprocess`: Used to spawn the C++ executable, feed it data via `stdin`, and capture its output via `stdout`.
- **JavaScript:** Handles client-side logic, input validation, and dynamic DOM manipulation.
- **Tailwind CSS:** A utility-first CSS framework used for styling the interface and creating the responsive Gantt chart visuals.
- **FontAwesome:** Used for UI icons.

## 3. Data Structures

The C++ backend relies on several key data structures to simulate the operating system's ready queue and process control blocks (PCBs):

- **Standard Vectors (`std::vector`):** Used extensively to store process attributes parallelly, including Process IDs (`pids`), Arrival Times (`at`), Burst Times (`bt`), Priorities (`pr`), and Remaining Times (`rt`). Vectors are also used to track the `first_start` time of each process to accurately calculate Response Time.
- **Queue (`std::queue`):** Specifically utilized in the Round Robin algorithm (`roundRobin` function) to represent the Ready Queue. Processes are pushed to the back of the queue when they arrive or are preempted, and popped from the front when assigned to the CPU.
- **JSON Objects (`nlohmann::json`):** Acts as the primary data transfer object (DTO) schema. The payload structure maintains lists of objects representing the Gantt chart execution blocks (start time, end time, process ID) and final metrics.

## 4. System Logic Flow

The execution flow from user input to visual output operates as follows:

1.  **Input & Validation (Frontend):** The user defines the Time Quantum, Priority Rule, and workload parameters in the UI. JavaScript performs strict validation to prevent invalid inputs (e.g., negative burst times, duplicate IDs, non-numeric characters).
2.  **API Request (Middleware):** Upon passing validation, JS constructs a JSON payload and sends an asynchronous HTTP POST request to the Flask `/api/simulate` endpoint.
3.  **Execution (Backend):** \* Flask invokes the compiled C++ executable (`scheduler`) using the `subprocess` module, passing the JSON string via standard input.
    - The C++ `main()` function parses the JSON and simultaneously runs both the `roundRobin` and `priorityPreemptive` algorithms on the exact same dataset to ensure a fair comparison.
4.  **Metric Calculation (Backend):**
    - During simulation, the backend records context switches to build the `gantt_chart` array.
    - Upon process completion, it calculates Waiting Time (WT = Turnaround Time - Burst Time), Turnaround Time (TAT = Completion Time - Arrival Time), and Response Time (RT = First Start Time - Arrival Time).
5.  **Response & Rendering (Frontend):** \* The C++ program outputs the comprehensive results as a JSON string to standard output, which Flask returns to the client.
    - The JavaScript `processAndRenderResults` function parses this data to dynamically generate the comparative summary cards, populate the Per-Process Metrics tables, and draw the proportional Gantt charts using calculated percentage widths (`(duration / totalTime) * 100`).
