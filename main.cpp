#include <iostream>
#include <vector>
#include <queue>
#include "include/json.hpp"

using namespace std;
using json = nlohmann::json;

int main() {
    json input;
    cin >> input;

    int n, time_quantum;

    cout << "Enter the total number of processes: ";
    cin >> n;

    vector<int> at(n), bt(n), rt(n);
    int total_wt = 0, total_tat = 0;

    cout << "Enter the Arrival time and Burst time for all processes\n";
    for (int i = 0; i < n; i++) {
        cout << "Arrival time for process " << i + 1 << ": ";
        cin >> at[i];
        cout << "Burst time for process " << i + 1 << ": ";
        cin >> bt[i];
        rt[i] = bt[i]; // Initialize remaining time
    }

    cout << "Enter the value of time QUANTUM: ";
    cin >> time_quantum;

    int current_time = 0;
    int completed = 0;
    queue<int> q;
    vector<bool> in_queue(n, false);

    // Push all processes that have arrived at time 0
    for (int i = 0; i < n; i++) {
        if (at[i] <= current_time && !in_queue[i]) {
            q.push(i);
            in_queue[i] = true;
        }
    }

    cout << "\nProcess\t: Turnaround Time : Waiting Time\n";

    while (completed != n) {
        // If queue is empty but processes are left, CPU is idle. Fast-forward time.
        if (q.empty()) {
            current_time++;
            for (int i = 0; i < n; i++) {
                if (at[i] <= current_time && !in_queue[i]) {
                    q.push(i);
                    in_queue[i] = true;
                }
            }
            continue;
        }

        // Get the next process from the queue
        int i = q.front();
        q.pop();

        // Determine how much time to process
        int time_to_execute = min(rt[i], time_quantum);
        
        // Advance time and reduce remaining time
        current_time += time_to_execute;
        rt[i] -= time_to_execute;

        // Check for new arrivals while this process was executing
        for (int j = 0; j < n; j++) {
            if (at[j] <= current_time && !in_queue[j] && j != i) {
                q.push(j);
                in_queue[j] = true;
            }
        }

        // If the current process is completely finished
        if (rt[i] == 0) {
            completed++;
            int tat = current_time - at[i];
            int wt = tat - bt[i];
            
            total_tat += tat;
            total_wt += wt;
            
            cout << "Process[" << i + 1 << "]\t:\t" << tat << "\t:\t" << wt << "\n";
        } 
        // If it's not finished, push it back to the end of the queue
        else {
            q.push(i);
        }
    }

    cout << "\nAverage waiting time: " << (float)total_wt / n << endl;
    cout << "Average turnaround time: " << (float)total_tat / n << endl;

    return 0;
}