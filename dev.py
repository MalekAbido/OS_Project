import os
import subprocess
import platform
import sys

print("🚀 Starting cross-platform build...")

try:
    # 1. Configure the project (OS Agnostic)
    print("-> Configuring CMake...")
    subprocess.run(["cmake", "-S", ".", "-B", "build"], check=True)

    # 2. Build the project (OS Agnostic)
    print("-> Compiling C++ code...")
    subprocess.run(["cmake", "--build", "build"], check=True)

    # 3. Figure out where the executable is based on the OS
    is_windows = platform.system() == "Windows"
    exe_name = "generator.exe" if is_windows else "generator"
    
    # Check standard Linux path first
    exe_path = os.path.join("build", exe_name)
    
    # If on Windows using Visual Studio, CMake puts it in a Debug folder
    if is_windows and not os.path.exists(exe_path):
        exe_path = os.path.join("build", "Debug", exe_name)

    if not os.path.exists(exe_path):
        print(f"❌ Error: Could not find the compiled executable at {exe_path}")
        sys.exit(1)

    # 4. Run the executable from the root folder
    print(f"-> Running {exe_path}...")
    # Because we run it from the root, chart_data.json is created right here!
    subprocess.run([exe_path], check=True)

    print("\n✅ Success! JSON data updated. Refresh your browser (F5).")

except subprocess.CalledProcessError:
    print("\n❌ Build or execution failed. Check the errors above.")
    sys.exit(1)