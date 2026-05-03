#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int main() {
    // Simulated core logic output
    string jsonOutput = R"({
        "title": "Project Workload",
        "labels": ["Core Logic", "UI/Gantt Charts", "Testing & Analysis"],
        "data": [40, 40, 20]
    })";

    // Write the JSON to a file
    ofstream outFile("chart_data.json");
    if (outFile.is_open()) {
        outFile << jsonOutput;
        outFile.close();
        cout << "Success: Generated chart_data.json in the current directory.\n";
    } else {
        cerr << "Error: Unable to open file for writing.\n";
        return 1;
    }
    
    return 0;
}