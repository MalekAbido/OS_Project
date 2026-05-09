#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <algorithm>
#include "include/json.hpp"

using json = nlohmann::json;
using namespace std;

json roundRobin(int time_quantum, vector<string> pids, vector<int> at, vector<int> bt, vector<int> rt)
{
    int n = pids.size();
    vector<int> first_start(n, -1);
    int total_wt = 0, total_tat = 0, total_rt = 0;

    json output_data;
    output_data["gantt_chart"] = json::array();
    output_data["metrics"] = json::array();

    int current_time = 0;
    int completed = 0;
    queue<int> q;
    vector<bool> in_queue(n, false);

    for (int i = 0; i < n; i++)
    {
        if (at[i] <= current_time && !in_queue[i])
        {
            q.push(i);
            in_queue[i] = true;
        }
    }

    while (completed != n)
    {
        if (q.empty())
        {
            current_time++;
            for (int i = 0; i < n; i++)
            {
                if (at[i] <= current_time && !in_queue[i])
                {
                    q.push(i);
                    in_queue[i] = true;
                }
            }
            continue;
        }

        int i = q.front();
        q.pop();

        int time_to_execute = min(rt[i], time_quantum);
        int start_time = current_time;

        if (first_start[i] == -1)
        {
            first_start[i] = start_time;
        }

        current_time += time_to_execute;
        rt[i] -= time_to_execute;

        output_data["gantt_chart"].push_back({{"process_id", pids[i]},
                                              {"start_time", start_time},
                                              {"end_time", current_time}});

        for (int j = 0; j < n; j++)
        {
            if (at[j] <= current_time && !in_queue[j] && j != i)
            {
                q.push(j);
                in_queue[j] = true;
            }
        }

        if (rt[i] == 0)
        {
            completed++;
            int tat = current_time - at[i];
            int wt = tat - bt[i];
            int resp_time = first_start[i] - at[i];

            total_tat += tat;
            total_wt += wt;
            total_rt += resp_time;

            output_data["metrics"].push_back({{"process_id", pids[i]},
                                              {"waiting_time", wt},
                                              {"turnaround_time", tat},
                                              {"response_time", resp_time}});
        }
        else
        {
            q.push(i);
        }
    }

    output_data["averages"] = {
        {"avg_wt", (float)total_wt / n},
        {"avg_tat", (float)total_tat / n},
        {"avg_rt", (float)total_rt / n}};

    return output_data;
}

json priorityPreemptive(string priority_rule, vector<string> pids, vector<int> at, vector<int> bt, vector<int> pr)
{
    int n = pids.size();
    vector<int> rt = bt; 
    vector<int> first_start(n, -1);

    int total_wt = 0, total_tat = 0, total_rt = 0;

    json output_data;
    output_data["gantt_chart"] = json::array();
    output_data["metrics"] = json::array();

    int currentTime = 0;
    int completed = 0;

    int prev_process = -1;
    int block_start_time = 0;

    while (completed != n)
    {
        int currentHighestPriorityIndex = -1;
        int currentHighestPriority = (priority_rule == "lower_is_higher") ? numeric_limits<int>::max() : -numeric_limits<int>::max();

        for (int i = 0; i < n; i++)
        {
            if (rt[i] > 0 && at[i] <= currentTime)
            {
                bool isBetter = false;

                if (priority_rule == "lower_is_higher")
                {
                    if (pr[i] < currentHighestPriority)
                        isBetter = true;
                    else if (pr[i] == currentHighestPriority && at[i] < at[currentHighestPriorityIndex])
                        isBetter = true;
                }
                else
                { 
                    if (pr[i] > currentHighestPriority)
                        isBetter = true;
                    else if (pr[i] == currentHighestPriority && at[i] < at[currentHighestPriorityIndex])
                        isBetter = true;
                }

                if (isBetter)
                {
                    currentHighestPriority = pr[i];
                    currentHighestPriorityIndex = i;
                }
            }
        }

        if (currentHighestPriorityIndex == -1)
        {
            if (prev_process != -1)
            {
                output_data["gantt_chart"].push_back({{"process_id", pids[prev_process]},
                                                      {"start_time", block_start_time},
                                                      {"end_time", currentTime}});
                prev_process = -1;
            }
            currentTime++;
            continue;
        }

        int idx = currentHighestPriorityIndex;

        if (prev_process != idx)
        {
            if (prev_process != -1)
            {
                output_data["gantt_chart"].push_back({{"process_id", pids[prev_process]},
                                                      {"start_time", block_start_time},
                                                      {"end_time", currentTime}});
            }
            block_start_time = currentTime;
            prev_process = idx;
        }

        if (first_start[idx] == -1)
        {
            first_start[idx] = currentTime;
        }

        rt[idx]--;
        currentTime++;

        if (rt[idx] == 0)
        {
            completed++;
            int tat = currentTime - at[idx];
            int wt = tat - bt[idx];
            int resp = first_start[idx] - at[idx];

            total_tat += tat;
            total_wt += wt;
            total_rt += resp;

            output_data["gantt_chart"].push_back({{"process_id", pids[idx]},
                                                  {"start_time", block_start_time},
                                                  {"end_time", currentTime}});
            prev_process = -1;

            output_data["metrics"].push_back({{"process_id", pids[idx]},
                                              {"waiting_time", wt},
                                              {"turnaround_time", tat},
                                              {"response_time", resp}});
        }
    }

    output_data["averages"] = {
        {"avg_wt", (float)total_wt / n},
        {"avg_tat", (float)total_tat / n},
        {"avg_rt", (float)total_rt / n}};

    return output_data;
}

int main()
{
    json input_data;
    json output_data;

    try
    {
        cin >> input_data;
    }
    catch (json::parse_error &e)
    {
        cerr << "JSON Parse Error: " << e.what() << '\n';
        return 1;
    }

    int time_quantum = input_data["time_quantum"];
    string priority_rule = input_data["priority_rule"];

    auto processes_json = input_data["processes"];
    int n = processes_json.size();

    vector<string> pids(n);
    vector<int> at(n), bt(n), pr(n);

    for (int i = 0; i < n; i++)
    {
        pids[i] = processes_json[i]["process_id"];
        at[i] = processes_json[i]["arrival_time"];
        bt[i] = processes_json[i]["burst_time"];
        pr[i] = processes_json[i]["priority"];
    }

    output_data["round_robin"] = roundRobin(time_quantum, pids, at, bt, bt);
    output_data["priority_preemptive"] = priorityPreemptive(priority_rule, pids, at, bt, pr);

    cout << output_data.dump() << endl;
    return 0;
}