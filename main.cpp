#include <iostream>
#include <string>
#include "include/json.hpp"

int main()
{
    int a, b, c;

    // Read 3 integers from standard input
    // If the input fails, we just default to some numbers
    if (!(std::cin >> a >> b >> c))
    {
        a = 10;
        b = 10;
        c = 10;
    }

    // Print the JSON directly to standard output instead of a file
    std::cout << R"({)" << "\n";
    std::cout << R"(  "title": "Dynamic Project Workload",)" << "\n";
    std::cout << R"(  "labels": ["Core Logic", "UI/Gantt", "Testing"],)" << "\n";
    std::cout << R"(  "data": [)" << a << ", " << b << ", " << c << "]\n";
    std::cout << R"(})" << "\n";

    return 0;
}